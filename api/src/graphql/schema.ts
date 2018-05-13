import mappingsToGraphql from "./mapper";
import { MappingService } from "hyperdoc-core";
import { GraphQLSchema } from "graphql";
import { IExecutionContext } from "hyperdoc-core/dist/model/IExecutionContext";

/**
 * Get a GraphQL schema from mapping service.
 *
 * @returns {Promise<GraphQLSchema>} GraphQL schema
 */
function getGraphqlSchema(context: IExecutionContext): Promise<GraphQLSchema> {
  return MappingService.list(context).then(mappingsToGraphql);
}

export default getGraphqlSchema;
