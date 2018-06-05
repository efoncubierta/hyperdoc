// external dependencies
import { DynamoDB } from "aws-sdk";
import { Option, none, some } from "fp-ts/lib/Option";

// Hyperdoc configuration
import { Hyperdoc } from "../../Hyperdoc";
import { HyperdocAWSDynamoDBTable } from "../../config/HyperdocConfig";

// Hyperdoc models
import { Node } from "../../model/Node";

// Hyperdoc stores
import { NodeStore } from "../NodeStore";
import { DynamoDBStore } from "./DynamoDBStore";

export class NodeDynamoDBStore extends DynamoDBStore implements NodeStore {
  private nodesTableConfig: HyperdocAWSDynamoDBTable;

  constructor() {
    super();
    this.nodesTableConfig = Hyperdoc.config().aws.dynamodb.nodes;
  }

  public get(uuid: string): Promise<Option<Node>> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .get({
        TableName: this.nodesTableConfig.tableName,
        Key: {
          uuid
        }
      })
      .promise()
      .then((result) => {
        return result.Item ? some(result.Item as Node) : none;
      });
  }

  public delete(uuid: string): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .delete({
        TableName: this.nodesTableConfig.tableName,
        Key: {
          uuid
        }
      })
      .promise()
      .then(() => {
        return;
      });
  }

  public put(node: Node): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .put({
        TableName: this.nodesTableConfig.tableName,
        Item: node
      })
      .promise()
      .then(() => {
        return;
      });
  }
}
