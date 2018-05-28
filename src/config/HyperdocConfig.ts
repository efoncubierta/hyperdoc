export interface HyperdocConfig {
  provider?: HyperdocProvider;
  serviceName?: string;
  stage?: string;
  aws?: HyperdocAWSConfig;
}

export enum HyperdocProvider {
  AWS = "AWS",
  INMEMORY = "INMEMORY"
}

export interface HyperdocAWSConfig {
  dynamodb?: HyperdocAWSDynamoDBConfig;
}

export interface HyperdocAWSDynamoDBConfig {
  mappings?: HyperdocAWSDynamoDBTable;
  nodes?: HyperdocAWSDynamoDBTable;
}

export interface HyperdocAWSDynamoDBTable {
  tableName: string;
}

export const HyperdocConfigDefault: HyperdocConfig = {
  provider: HyperdocProvider.AWS,
  serviceName: "hyperdoc",
  stage: "dev",
  aws: {
    dynamodb: {
      mappings: {
        tableName: process.env.MAPPINGS_TABLE_NAME
      },
      nodes: {
        tableName: process.env.NODES_TABLE_NAME
      }
    }
  }
};
