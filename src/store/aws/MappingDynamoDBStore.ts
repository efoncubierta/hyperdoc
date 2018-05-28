// external dependencies
import { DynamoDB } from "aws-sdk";

// hyperdoc
import { Hyperdoc } from "../../Hyperdoc";
import { HyperdocAWSDynamoDBTable } from "../../config/HyperdocConfig";

// models
import { Mapping } from "../../model/Mapping";

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

    return new Promise((resolve, reject) => {
      documentClient.scan(
        {
          TableName: this.mappingsTableConfig.tableName
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.Items as Mapping[]);
          }
        }
      );
    });
  }

  public get(uuid: string): Promise<Mapping> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.get(
        {
          TableName: this.mappingsTableConfig.tableName,
          Key: {
            uuid
          }
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.Item as Mapping);
          }
        }
      );
    });
  }

  public getByName(name: string): Promise<Mapping> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.query(
        {
          TableName: this.mappingsTableConfig.tableName,
          IndexName: "NameIndex",
          KeyConditionExpression: "name = :name",
          ExpressionAttributeValues: {
            ":sequence": name
          },
          Limit: 1
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.Items.length > 0 ? (result.Items[0] as Mapping) : null);
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
          TableName: this.mappingsTableConfig.tableName,
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

  public put(mapping: Mapping): Promise<void> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.put(
        {
          TableName: this.mappingsTableConfig.tableName,
          Item: mapping
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
