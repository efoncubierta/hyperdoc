import * as AWS from "aws-sdk-mock";
import { Hyperdoc } from "../../../../src/Hyperdoc";
import { AWSDocumentClientMock } from "./AWSDocumentClientMock";
import { AWSNodeDocumentClientMock } from "./AWSNodeDocumentClientMock";
import { AWSMappingDocumentClientMock } from "./AWSMappingDocumentClientMock";

/**
 * Mock AWS DynamoDB API.
 */
export class AWSDynamoDBMock {
  private static nodeDocumentClientMock: AWSDocumentClientMock = new AWSNodeDocumentClientMock();
  private static mappingDocumentClientMock: AWSDocumentClientMock = new AWSMappingDocumentClientMock();

  /**
   * Mock the DocumentClient.get call.
   *
   * @param params DocumentClient.get input parameters
   * @param callback Callback
   */
  private static documentClientGetMock(params, callback): void {
    if (AWSDynamoDBMock.nodeDocumentClientMock.canHandleGet(params)) {
      AWSDynamoDBMock.nodeDocumentClientMock.handleGet(params, callback);
    } else if (AWSDynamoDBMock.mappingDocumentClientMock.canHandleGet(params)) {
      AWSDynamoDBMock.mappingDocumentClientMock.handleGet(params, callback);
    } else {
      return callback(new Error("This DocumentClient.get() call hasn't been mocked."));
    }
  }

  /**
   * Mock the DocumentClient.put() call.
   *
   * @param params DocumentClient.put() input parameters
   * @param callback Callback
   */
  private static documentClientPutMock(params, callback): void {
    if (AWSDynamoDBMock.nodeDocumentClientMock.canHandlePut(params)) {
      AWSDynamoDBMock.nodeDocumentClientMock.handlePut(params, callback);
    } else if (AWSDynamoDBMock.mappingDocumentClientMock.canHandlePut(params)) {
      AWSDynamoDBMock.mappingDocumentClientMock.handlePut(params, callback);
    } else {
      return callback(new Error("This DocumentClient.put() call hasn't been mocked."));
    }
  }

  /**
   * Mock the DocumentClient.delete() call.
   *
   * @param params DocumentClient.delete() input parameters
   * @param callback Callback
   */
  private static documentClientDeleteMock(params, callback): void {
    if (AWSDynamoDBMock.nodeDocumentClientMock.canHandleDelete(params)) {
      AWSDynamoDBMock.nodeDocumentClientMock.handleDelete(params, callback);
    } else if (AWSDynamoDBMock.mappingDocumentClientMock.canHandleDelete(params)) {
      AWSDynamoDBMock.mappingDocumentClientMock.handleDelete(params, callback);
    } else {
      return callback(new Error("This DocumentClient.delete() call hasn't been mocked."));
    }
  }

  /**
   * Mock the DocumentClient.query() call.
   *
   * @param params DocumentClient.query() input parameters
   * @param callback Callback
   */
  private static documentClientQueryMock(params, callback): void {
    if (AWSDynamoDBMock.nodeDocumentClientMock.canHandleQuery(params)) {
      AWSDynamoDBMock.nodeDocumentClientMock.handleQuery(params, callback);
    } else if (AWSDynamoDBMock.mappingDocumentClientMock.canHandleQuery(params)) {
      AWSDynamoDBMock.mappingDocumentClientMock.handleQuery(params, callback);
    } else {
      return callback(new Error("This DocumentClient.query() call hasn't been mocked."));
    }
  }

  /**
   * Mock the DocumentClient.scan() call.
   *
   * @param params DocumentClient.query() input parameters
   * @param callback Callback
   */
  private static documentClientScanMock(params, callback): void {
    if (AWSDynamoDBMock.nodeDocumentClientMock.canHandleScan(params)) {
      AWSDynamoDBMock.nodeDocumentClientMock.handleScan(params, callback);
    } else if (AWSDynamoDBMock.mappingDocumentClientMock.canHandleScan(params)) {
      AWSDynamoDBMock.mappingDocumentClientMock.handleScan(params, callback);
    } else {
      return callback(new Error("This DocumentClient.scan() call hasn't been mocked."));
    }
  }

  /**
   * Mock the DocumentClient.batchWrite() call.
   *
   * @param params DocumentClient.batchWrite() input parameters
   * @param callback Callback
   */
  private static documentClientBatchWriteMock(params, callback): void {
    if (AWSDynamoDBMock.nodeDocumentClientMock.canHandleBatchWrite(params)) {
      AWSDynamoDBMock.nodeDocumentClientMock.handleBatchWrite(params, callback);
    } else if (AWSDynamoDBMock.mappingDocumentClientMock.canHandleBatchWrite(params)) {
      AWSDynamoDBMock.mappingDocumentClientMock.handleBatchWrite(params, callback);
    } else {
      return callback(new Error("This DocumentClient.batchWrite() call hasn't been mocked."));
    }
  }

  /**
   * Enable the AWS mockup.
   */
  public static enableMock(): void {
    AWS.mock("DynamoDB.DocumentClient", "get", AWSDynamoDBMock.documentClientGetMock);
    AWS.mock("DynamoDB.DocumentClient", "put", AWSDynamoDBMock.documentClientPutMock);
    AWS.mock("DynamoDB.DocumentClient", "delete", AWSDynamoDBMock.documentClientDeleteMock);
    AWS.mock("DynamoDB.DocumentClient", "query", AWSDynamoDBMock.documentClientQueryMock);
    AWS.mock("DynamoDB.DocumentClient", "scan", AWSDynamoDBMock.documentClientScanMock);
    AWS.mock("DynamoDB.DocumentClient", "batchWrite", AWSDynamoDBMock.documentClientBatchWriteMock);

    Hyperdoc.config({
      aws: {
        dynamodb: {
          nodes: {
            tableName: AWSNodeDocumentClientMock.TABLE_NAME
          },
          mappings: {
            tableName: AWSMappingDocumentClientMock.TABLE_NAME
          }
        }
      }
    });
  }

  /**
   * Restore AWS mockup back to normal.
   */
  public static restoreMock(): void {
    AWS.restore("DynamoDB.DocumentClient");

    // restore Hyperdoc default configuration
    Hyperdoc.resetConfig();
  }
}
