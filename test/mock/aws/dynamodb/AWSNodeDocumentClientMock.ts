import { AWSDocumentClientMock } from "./AWSDocumentClientMock";
import { InMemoryNodeStore } from "../../InMemoryNodeStore";

export class AWSNodeDocumentClientMock implements AWSDocumentClientMock {
  public static TABLE_NAME = "hyperdoc-test-nodes";

  public canHandleGet(params: any): boolean {
    return params.TableName === AWSNodeDocumentClientMock.TABLE_NAME;
  }

  public handleGet(params: any, callback: (error?: Error, response?: any) => void): void {
    const uuid: string = params.Key.uuid;
    callback(null, {
      Item: InMemoryNodeStore.get(uuid)
    });
  }

  public canHandlePut(params: any): boolean {
    return params.TableName === AWSNodeDocumentClientMock.TABLE_NAME;
  }

  public handlePut(params: any, callback: (error?: Error, response?: any) => void): void {
    InMemoryNodeStore.put(params.Item);
    callback(null);
  }

  public canHandleDelete(params: any): boolean {
    return params.TableName === AWSNodeDocumentClientMock.TABLE_NAME;
  }

  public handleDelete(params: any, callback: (error?: Error, response?: any) => void): void {
    const uuid: string = params.Key.uuid;
    InMemoryNodeStore.delete;
    callback(null);
  }

  public canHandleQuery(params: any): boolean {
    return false;
  }

  public handleQuery(params: any, callback: (error?: Error, response?: any) => void): void {
    throw new Error("Method not implemented.");
  }

  public canHandleScan(params: any): boolean {
    return false;
  }

  public handleScan(params: any, callback: (error?: Error, response?: any) => void): boolean {
    throw new Error("Method not implemented.");
  }

  public canHandleBatchWrite(params: any): boolean {
    return false;
  }

  public handleBatchWrite(params: any, callback: (error?: Error, response?: any) => void): void {
    throw new Error("Method not implemented.");
  }
}
