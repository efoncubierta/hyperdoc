import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

import { graphqlLambda } from "apollo-server-lambda";
import getGraphqlSchema from "../../graphql/schema";
import { IExecutionContext } from "hyperdoc-core/dist/model/IExecutionContext";
import NodeDynamoDBStore from "hyperdoc-core/dist/store/aws/NodeDynamoDBStore";
import MappingDynamoDBStore from "hyperdoc-core/dist/store/aws/MappingDynamoDBStore";

const executionContext: IExecutionContext = {
  auth: {
    userUuid: "1234"
  },
  stores: {
    nodes: new NodeDynamoDBStore(process.env.NODES_TABLE),
    mappings: new MappingDynamoDBStore(process.env.MAPPINGS_TABLE)
  }
};

export const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const callbackFilter = (error, output) => {
    output.headers["Access-Control-Allow-Origin"] = "*";
    callback(error, output);
  };
  getGraphqlSchema(executionContext).then((graphqlSchema) => {
    const graphqlHandler = graphqlLambda({
      schema: graphqlSchema
    });

    return graphqlHandler(event, context, callbackFilter);
  });
};
