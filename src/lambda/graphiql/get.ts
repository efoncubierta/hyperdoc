import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda";

import { graphiqlLambda } from "apollo-server-lambda";

export const handler: Handler = graphiqlLambda({ endpointURL: "/dev/graphql" });
