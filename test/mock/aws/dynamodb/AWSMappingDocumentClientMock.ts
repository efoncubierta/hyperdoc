import { AWSDocumentClientMock } from "./AWSDocumentClientMock";
import { InMemoryMappingStore } from "../../InMemoryMappingStore";
import { MappingId } from "../../../../src/model/Mapping";
import { NodeId } from "../../../../src/model/Node";

export class AWSMappingDocumentClientMock implements AWSDocumentClientMock {
  public static TABLE_NAME = "hyperdoc-test-mappings";

  public canHandleGet(params: any): boolean {
    return params.TableName === AWSMappingDocumentClientMock.TABLE_NAME;
  }

  public handleGet(params: any, callback: (error?: Error, response?: any) => void): void {
    const mappingId: MappingId = params.Key.mappingId;
    const mapping = InMemoryMappingStore.get(mappingId);

    callback(null, {
      Item: mapping
    });
  }

  public canHandlePut(params: any): boolean {
    return params.TableName === AWSMappingDocumentClientMock.TABLE_NAME;
  }

  public handlePut(params: any, callback: (error?: Error, response?: any) => void): void {
    InMemoryMappingStore.put(params.Item);
    callback(null);
  }

  public canHandleDelete(params: any): boolean {
    return params.TableName === AWSMappingDocumentClientMock.TABLE_NAME;
  }

  public handleDelete(params: any, callback: (error?: Error, response?: any) => void): void {
    const mappingId: NodeId = params.Key.mappingId;
    InMemoryMappingStore.delete(mappingId);
    callback(null);
  }

  public canHandleQuery(params: any): boolean {
    return params.TableName === AWSMappingDocumentClientMock.TABLE_NAME;
  }

  public handleQuery(params: any, callback: (error?: Error, response?: any) => void): void {
    if (params.KeyConditionExpression === "name = :name") {
      const name = params.ExpressionAttributeValues[":name"];
      callback(null, {
        Items: InMemoryMappingStore.findByName(name)
      });
    } else {
      callback(new Error(`Unrecognise request pattern to DocumentClient.query() for table ${params.TableName}`));
    }
  }

  public canHandleScan(params: any): boolean {
    return params.TableName === AWSMappingDocumentClientMock.TABLE_NAME;
  }

  public handleScan(params: any, callback: (error?: Error, response?: any) => void): void {
    callback(null, {
      Items: InMemoryMappingStore.list()
    });
  }

  public canHandleBatchWrite(params: any): boolean {
    return false;
  }

  public handleBatchWrite(params: any, callback: (error?: Error, response?: any) => void): void {
    throw new Error("Method not implemented.");
  }
}
