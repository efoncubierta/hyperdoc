// graphql dependencies
import { GraphQLSchema } from "graphql";

import { ExecutionContext } from "../ExecutionContext";

// Hyperdoc readers
import { MappingReader } from "../reader/MappingReader";

import { MappingsToGraphQLSchemaMapper } from "./MappingsToGraphQLSchemaMapper";

/**
 * Get a GraphQL schema from mapping service.
 *
 * @returns GraphQL schema
 */
function getGraphqlSchema(context: ExecutionContext): Promise<GraphQLSchema> {
  const mapper = new MappingsToGraphQLSchemaMapper();
  return MappingReader.list(context).then(mapper.map);
}

export default getGraphqlSchema;
