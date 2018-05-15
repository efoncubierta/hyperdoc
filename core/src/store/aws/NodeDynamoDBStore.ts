import { DynamoDB } from "aws-sdk";
import { Node } from "../../model/Node";
import NodeStore from "../NodeStore";

/**
 * Manage node data in a DynamoDB table.
 */
export default class NodeDynamoDBStore implements NodeStore {
  private readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  public get(uuid: string): Promise<Node> {
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
            resolve(result.Item as Node);
          }
        }
      );
    });
  }

  public save(node: Node): Promise<Node> {
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
