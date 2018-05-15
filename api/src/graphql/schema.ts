import mappingsToGraphql from "./mapper";
import { MappingService } from "hyperdoc-core";
import { GraphQLSchema } from "graphql";
import { ExecutionContext } from "hyperdoc-core/dist/model/ExecutionContext";

/**
 * Get a GraphQL schema from mapping service.
 *
 * @returns {Promise<GraphQLSchema>} GraphQL schema
 */
function getGraphqlSchema(context: ExecutionContext): Promise<GraphQLSchema> {
  return MappingService.list(context).then(mappingsToGraphql);
}

export default getGraphqlSchema;
