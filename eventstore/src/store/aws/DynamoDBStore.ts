import { DynamoDB } from "aws-sdk";
import { BatchWriteItemRequestMap, BatchWriteItemOutput } from "aws-sdk/clients/dynamodb";
import { operation as retryOperation } from "retry";

export abstract class DynamoDBStore {
  protected readonly tableName: string;

  /**
   * Constructor.
   *
   * @param tableName DynamoDB table name
   */
  protected constructor(tableName) {
    this.tableName = tableName;
  }

  protected retryBatchWrite(requestItems: BatchWriteItemRequestMap): Promise<BatchWriteItemOutput> {
    const documentClient = new DynamoDB.DocumentClient();

    const operation = retryOperation({
      retries: 3,
      minTimeout: 200
    });

    return new Promise((resolve, reject) => {
      operation.attempt((current) => {
        documentClient.batchWrite(
          {
            RequestItems: requestItems
          },
          (error, result) => {
            // retry?
            if (operation.retry(error)) {
              return;
            }

            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
      });
    });
  }
}
