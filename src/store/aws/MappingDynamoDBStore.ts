// External dependencies
import { DynamoDB } from "aws-sdk";
import { Option, some, none } from "fp-ts/lib/Option";

// Hyperdoc configuration
import { Hyperdoc } from "../../Hyperdoc";
import { HyperdocAWSDynamoDBTable } from "../../config/HyperdocConfig";

// Hyperdoc models
import { Mapping } from "../../model/Mapping";

// Hyperdoc stores
import { MappingStore } from "../MappingStore";
import { DynamoDBStore } from "./DynamoDBStore";

export class MappingDynamoDBStore extends DynamoDBStore implements MappingStore {
  private mappingsTableConfig: HyperdocAWSDynamoDBTable;

  constructor() {
    super();
    this.mappingsTableConfig = Hyperdoc.config().aws.dynamodb.mappings;
  }

  public list(): Promise<Mapping[]> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .scan({
        TableName: this.mappingsTableConfig.tableName
      })
      .promise()
      .then((result) => {
        return result.Items as Mapping[];
      });
  }

  public get(mappingId: string): Promise<Option<Mapping>> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .get({
        TableName: this.mappingsTableConfig.tableName,
        Key: {
          mappingId
        }
      })
      .promise()
      .then((result) => {
        return result.Item ? some(result.Item as Mapping) : none;
      });
  }

  public getByName(name: string): Promise<Option<Mapping>> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .query({
        TableName: this.mappingsTableConfig.tableName,
        IndexName: "NameIndex",
        KeyConditionExpression: "#name = :name",
        ExpressionAttributeNames: {
          "#name": "name"
        },
        ExpressionAttributeValues: {
          ":name": name
        },
        Limit: 1
      })
      .promise()
      .then((result) => {
        return result.Items && result.Items.length > 0 ? this.get(result.Items[0].mappingId) : none;
      });
  }

  public delete(mappingId: string): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .delete({
        TableName: this.mappingsTableConfig.tableName,
        Key: {
          mappingId
        }
      })
      .promise()
      .then(() => {
        return;
      });
  }

  public put(mapping: Mapping): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return documentClient
      .put({
        TableName: this.mappingsTableConfig.tableName,
        Item: mapping
      })
      .promise()
      .then(() => {
        return;
      });
  }
}
