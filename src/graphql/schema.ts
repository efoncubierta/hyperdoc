// graphql dependencies
import { GraphQLSchema } from "graphql";

// services
import { ExecutionContext } from "../service/ExecutionContext";
import { MappingService } from "../service/MappingService";

import mappingsToGraphql from "./mapper";

/**
 * Get a GraphQL schema from mapping service.
 *
 * @returns GraphQL schema
 */
function getGraphqlSchema(context: ExecutionContext): Promise<GraphQLSchema> {
  return MappingService.list(context).then(mappingsToGraphql);
}

export default getGraphqlSchema;
