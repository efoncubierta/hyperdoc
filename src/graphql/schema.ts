// graphql dependencies
import { GraphQLSchema } from "graphql";

import { ExecutionContext } from "../ExecutionContext";

// Hyperdoc readers
import { MappingReader } from "../reader/MappingReader";

import mappingsToGraphql from "./mapper";

/**
 * Get a GraphQL schema from mapping service.
 *
 * @returns GraphQL schema
 */
function getGraphqlSchema(context: ExecutionContext): Promise<GraphQLSchema> {
  return MappingReader.list(context).then(mappingsToGraphql);
}

export default getGraphqlSchema;
