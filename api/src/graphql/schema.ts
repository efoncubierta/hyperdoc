import mappingsToGraphql from "./mapper";
import { GraphQLSchema } from "graphql";
import { ExecutionContext, MappingService } from "hyperdoc-backend";

/**
 * Get a GraphQL schema from mapping service.
 *
 * @returns {Promise<GraphQLSchema>} GraphQL schema
 */
function getGraphqlSchema(context: ExecutionContext): Promise<GraphQLSchema> {
  return MappingService.list(context).then(mappingsToGraphql);
}

export default getGraphqlSchema;
