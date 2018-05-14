import { DynamoDB } from "aws-sdk";
import { IMapping, IMappings } from "../../model/IMapping";
import IMappingStore from "../IMappingStore";

/**
 * Manage mapping data in a DynamoDB table;
 */
export default class MappingDynamoDBStore implements IMappingStore {
  private readonly tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  public list(): Promise<IMappings> {
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
            const mappings: IMappings = {};
            result.Items.forEach((item) => {
              const mapping = item as IMapping;
              mappings[mapping.name] = mapping;
            });
            resolve(mappings);
          }
        }
      );
    });
  }

  public get(uuid: string): Promise<IMapping> {
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
            resolve(result.Item as IMapping);
          }
        }
      );
    });
  }

  public getByName(name: string): Promise<IMapping> {
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
            resolve(result.Items ? (result.Items[0] as IMapping) : null);
          }
        }
      );
    });
  }

  public save(mapping: IMapping): Promise<IMapping> {
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
