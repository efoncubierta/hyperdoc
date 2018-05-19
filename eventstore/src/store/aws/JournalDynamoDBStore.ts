import { DynamoDB } from "aws-sdk";
import { JournalStore, Status, BatchStatus, ErrorStatus } from "../JournalStore";
import { Event } from "../../message/Event";
import { DynamoDBStore } from "./DynamoDBStore";
import { BatchWriteItemOutput } from "aws-sdk/clients/dynamodb";

/**
 * Manage journals in a DynamoDB table.
 */
export class JournalDynamoDBStore extends DynamoDBStore implements JournalStore {
  /**
   * Constructor.
   *
   * @param tableName DynamoDB table name
   */
  constructor(tableName: string) {
    super(tableName);
  }

  public saveAll(events: Event[]): Promise<BatchStatus<Event>> {
    return this.batchPutEvents(events);
  }

  public rollbackTo(aggregateId: string, sequence: number): Promise<BatchStatus<Event>> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.query(
        {
          TableName: this.tableName,
          ProjectionExpression: "$aggregateId, $sequence",
          KeyConditionExpression: "$aggregateId = :aggregateId AND $sequence >= :sequence",
          ExpressionAttributeValues: {
            aggregateId,
            sequence
          }
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.Items as Event[]);
          }
        }
      );
    }).then(this.batchDeleteEvents);
  }

  public rollforwardTo(aggregateId: string, sequence: number): Promise<BatchStatus<Event>> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.query(
        {
          TableName: this.tableName,
          ProjectionExpression: "$aggregateId, $sequence",
          KeyConditionExpression: "$aggregateId = :aggregateId AND $sequence <= :sequence",
          ExpressionAttributeValues: {
            aggregateId,
            sequence
          }
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.Items as Event[]);
          }
        }
      );
    }).then(this.batchDeleteEvents);
  }

  public getEvents(aggregateId: string, fromSequence: number, toSequence: number): Promise<Event[]> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.query(
        {
          TableName: this.tableName,
          KeyConditionExpression: "$aggregateId = :aggregateId AND $sequence BETWEEN :fromSequence AND :toSequence",
          ExpressionAttributeValues: {
            aggregateId,
            fromSequence,
            toSequence
          }
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.Items as Event[]);
          }
        }
      );
    });
  }

  public getLastSequence(aggregateId: string, fromSequence: number): Promise<number> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.query(
        {
          TableName: this.tableName,
          KeyConditionExpression: "$aggregateId = :aggregateId AND $sequence >= :fromSequence",
          ExpressionAttributeValues: {
            aggregateId,
            fromSequence
          }
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            // reduce list of events to get the last number. Default 0
            const lastSequence = (result.Items as Event[]).reduce((last, current) => {
              return Math.max(last, current.$sequence);
            }, 0);

            resolve(lastSequence);
          }
        }
      );
    });
  }

  private batchPutEvents(events: Event[]): Promise<BatchStatus<Event>> {
    /*
      * Build the following data structure:
      *
      * RequestItems: {
      *   TABLE_NAME: [{
      *     PutRequest: {
      *       Item: EVENT_1
      *     }
      *   }, {
      *     PutRequest: {
      *       Item: EVENT_2
      *     }
      *   }]
      * }
      */
    const requestItems = {};
    requestItems[this.tableName] = events.map((event) => {
      return {
        PutRequest: {
          Item: event
        }
      };
    });

    return this.retryBatchWrite(requestItems).then((result) => {
      return this.toBatchStatus(events, result);
    });
  }

  private batchDeleteEvents(events: Event[]): Promise<BatchStatus<Event>> {
    /*
      * Build the following data structure:
      *
      * RequestItems: {
      *   TABLE_NAME: [{
      *     DeleteRequest: {
      *       Key: {
      *         $aggregateId: AGGREGATE_ID_1,
      *         $sequence: SEQUENCE_N_1
      *       }
      *     }
      *   }, {
      *     DeleteRequest: {
      *       Key: {
      *         $aggregateId: AGGREGATE_ID_2,
      *         $sequence: SEQUENCE_N_2
      *       }
      *     }
      *   }]
      * }
      */
    const requestItems = {};
    requestItems[this.tableName] = events.map((event) => {
      return {
        DeleteRequest: {
          Key: {
            $aggregateId: event.$aggregateId,
            $sequence: event.$sequence
          }
        }
      };
    });

    return this.retryBatchWrite(requestItems).then((result) => {
      return this.toBatchStatus(events, result);
    });
  }

  private toBatchStatus(events: Event[], result: BatchWriteItemOutput): BatchStatus<Event> {
    const sequences = result.UnprocessedItems[this.tableName].map((request) => {
      return Number(
        request.DeleteRequest ? request.DeleteRequest.Key.$sequence.N : request.PutRequest.Item.$sequence.N
      );
    });

    const errors: Array<ErrorStatus<Event>> = events
      .filter((event) => {
        // filter out processed items
        return sequences.indexOf(event.$sequence) >= 0;
      })
      .map((event) => {
        return {
          reason: `Event ${event.$event}(${event.$aggregateId}, ${event.$sequence}) couldn't be processed by DynamoDB`,
          item: event
        };
      });

    return {
      success: errors.length === 0,
      errors
    };
  }
}
