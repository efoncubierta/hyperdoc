/**
 * Hyperdoc configuration structure.
 */
export interface HyperdocConfig {
  provider: HyperdocProvider;
  serviceName: string;
  stage: string;
  aws: HyperdocAWSConfig;
}

/**
 * Each different provider supported by Hyperdoc.
 */
export enum HyperdocProvider {
  AWS = "AWS",
  INMEMORY = "INMEMORY"
}

/**
 * Hyperdoc configuration related to AWS.
 */
export interface HyperdocAWSConfig {
  dynamodb: HyperdocAWSDynamoDBConfig;
}

/**
 * Hyperdoc configuration related to AWS DynamoDB.
 */
export interface HyperdocAWSDynamoDBConfig {
  mappings: HyperdocAWSDynamoDBTable;
  nodes: HyperdocAWSDynamoDBTable;
}

/**
 * Hyperdoc configuration related to an specific AWS DynamoDB table.
 */
export interface HyperdocAWSDynamoDBTable {
  tableName: string;
}

/**
 * Hyperdoc default configuration.
 *
 * By default, Hyperdoc is configured assuming it'll be run on AWS. It uses the environment
 * variables, normally configured in the serverless.yml file, or default to the following values:
 *
 * - **provider**: AWS
 * - **serviceName**: ${env:SERVICE_NAME} or "hyperdoc"
 * - **stage**: ${env:STAGE} or "dev"
 * - **aws**:
 * - - **dynamodb**:
 * - - - **mappings**:
 * - - - - **tableName**: ${env:MAPPINGS_TABLE_NAME} || "hyperdoc-dev-mappings"
 * - - - **nodes**:
 * - - - - **tableName**: ${env:NODES_TABLE_NAME} || "hyperdoc-dev-nodes"
 */
export const HyperdocConfigDefault: HyperdocConfig = {
  provider: HyperdocProvider.AWS,
  serviceName: process.env.SERVICE_NAME || "hyperdoc",
  stage: process.env.STAGE || "dev",
  aws: {
    dynamodb: {
      mappings: {
        tableName: process.env.MAPPINGS_TABLE_NAME || "hyperdoc-dev-mappings"
      },
      nodes: {
        tableName: process.env.NODES_TABLE_NAME || "hyperdoc-dev-nodes"
      }
    }
  }
};
