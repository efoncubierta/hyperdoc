// external dependencies
import { DynamoDB } from "aws-sdk";

// hyperdoc
import { Hyperdoc } from "../../Hyperdoc";
import { HyperdocAWSDynamoDBTable } from "../../config/HyperdocConfig";

// models
import { Node } from "../../model/Node";

import { NodeStore } from "../NodeStore";
import { DynamoDBStore } from "./DynamoDBStore";

export class NodeDynamoDBStore extends DynamoDBStore implements NodeStore {
  private nodesTableConfig: HyperdocAWSDynamoDBTable;

  constructor() {
    super();
    this.nodesTableConfig = Hyperdoc.config().aws.dynamodb.nodes;
  }

  public get(uuid: string): Promise<Node> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.get(
        {
          TableName: this.nodesTableConfig.tableName,
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

  public delete(uuid: string): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.delete(
        {
          TableName: this.nodesTableConfig.tableName,
          Key: {
            uuid
          }
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }

  public put(node: Node): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.put(
        {
          TableName: this.nodesTableConfig.tableName,
          Item: node
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        }
      );
    });
  }
}
