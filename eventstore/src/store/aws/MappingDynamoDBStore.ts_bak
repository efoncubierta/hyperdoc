import { DynamoDB } from "aws-sdk";
import { Mapping, Mappings } from "../../model/Mapping";
import MappingStore from "../MappingStore";

/**
 * Manage mapping data in a DynamoDB table;
 */
export default class MappingDynamoDBStore implements MappingStore {
  private readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  public list(): Promise<Mappings> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.scan(
        {
          TableName: this.tableName
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            const mappings: Mappings = {};
            result.Items.forEach((item) => {
              const mapping = item as Mapping;
              mappings[mapping.name] = mapping;
            });
            resolve(mappings);
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
          TableName: this.tableName,
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
          TableName: this.tableName,
          KeyConditionExpression: "name = :name",
          ExpressionAttributeValues: { ":name": name }
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.Items ? (result.Items[0] as Mapping) : null);
          }
        }
      );
    });
  }

  public save(mapping: Mapping): Promise<Mapping> {
    const documentClient = new DynamoDB.DocumentClient();

    return new Promise((resolve, reject) => {
      documentClient.put(
        {
          TableName: this.tableName,
          Item: mapping
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(mapping);
          }
        }
      );
    });
  }
}
