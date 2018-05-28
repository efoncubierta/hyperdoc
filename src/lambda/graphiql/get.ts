import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

import { graphiqlLambda } from "apollo-server-lambda";

/**
 * AWS Lambda function to handle requests to /graphiql, an GraphQL client for the
 * /graphql endpoint. This endpoints is usually enabled for testing purposes.
 */
export const handler: Handler = graphiqlLambda({ endpointURL: "/dev/graphql" });
