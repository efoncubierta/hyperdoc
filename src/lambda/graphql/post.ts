// aws dependencies
import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

// external dependencies
import { graphqlLambda } from "apollo-server-lambda";

// hyperdoc dependencies
import { ExecutionContext } from "../../service/ExecutionContext";

// hyperdoc-api dependencies
import getGraphqlSchema from "../../graphql/schema";

const executionContext: ExecutionContext = {
  auth: {
    userUuid: "1234"
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
