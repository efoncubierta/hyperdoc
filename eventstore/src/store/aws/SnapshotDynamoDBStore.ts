import { DynamoDB } from "aws-sdk";
import { SnapshotStore } from "../SnapshotStore";
import { Snapshot } from "../../message/Snapshot";
import { DynamoDBStore } from "./DynamoDBStore";

/**
 * Manage snapshots in a DynamoDB table.
 */
export class SnapshotDynamoDBStore extends DynamoDBStore implements SnapshotStore {
  /**
   * Constructor.
   *
   * @param tableName DynamoDB table name
   */
  constructor(tableName: string) {
    super(tableName);
  }

  public get(aggregateId: string): Promise<Snapshot> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.query(
        {
          TableName: this.tableName,
          KeyConditionExpression: "$aggregateId = :aggregateId",
          ExpressionAttributeValues: {
            aggregateId
          },
          ScanIndexForward: false,
          Limit: 1
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.Items.length > 0 ? (result.Items[0] as Snapshot) : null);
          }
        }
      );
    });
  }

  public save(snapshot: Snapshot): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.put(
        {
          TableName: this.tableName,
          Item: snapshot
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  public rollforwardTo(aggregateId: string, sequence: number): Promise<void> {
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
            resolve(result.Items as Snapshot[]);
          }
        }
      );
    }).then(this.batchDeleteSnapshots);
  }

  private batchDeleteSnapshots(snapshots: Snapshot[]): Promise<void> {
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
    requestItems[this.tableName] = snapshots.map((event) => {
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
      // ignore unprocessed items. They'll get deleted in the next iteration
      return null;
    });
  }
}
