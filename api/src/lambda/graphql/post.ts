import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

import { graphqlLambda } from "apollo-server-lambda";
import getGraphqlSchema from "../../graphql/schema";

export const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  const callbackFilter = (error, output) => {
    output.headers["Access-Control-Allow-Origin"] = "*";
    callback(error, output);
  };
  getGraphqlSchema().then((graphqlSchema) => {
    const graphqlHandler = graphqlLambda({
      schema: graphqlSchema
    });

    return graphqlHandler(event, context, callbackFilter);
  });
};
