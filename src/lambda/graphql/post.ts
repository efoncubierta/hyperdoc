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

/**
 * AWS Lambda function to handle requests to /graphql endpoint. This is the GraphQL endpoint, used to
 * manage Hyperdoc data.
 *
 * @param event AWS API Gateway event
 * @param context AWS Lambda execution context
 * @param callback Callback
 */
export const handler: Handler = (event: APIGatewayEvent, context: Context, callback: Callback) => {
  // TODO make CORS options filter configurable
  const callbackFilter = (error: Error | undefined | null, output: any) => {
    output.headers["Access-Control-Allow-Origin"] = "*";
    callback(error, output);
  };

  // get the Hyperdoc schema as a GraphQL schema representation
  getGraphqlSchema(executionContext)
    .then((graphqlSchema) => {
      // create Apollo GraphQL server
      const graphqlHandler = graphqlLambda({
        schema: graphqlSchema
      });

      return graphqlHandler(event, context, callbackFilter);
    })
    .catch(callback);
};
