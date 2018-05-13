import { DynamoDB } from "aws-sdk";
import { INode } from "../../model/INode";
import INodeStore from "../INodeStore";

/**
 * Manage node data in a DynamoDB table.
 */
export default class NodeDynamoDBStore implements INodeStore {
  private readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  public get(uuid: string): Promise<INode> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.get(
        {
          TableName: this.tableName,
          Key: {
            uuid
          }
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.Item as INode);
          }
        }
      );
    });
  }

  public save(node: INode): Promise<INode> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.put(
        {
          TableName: this.tableName,
          Item: node
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(node);
          }
        }
      );
    });
  }
}
