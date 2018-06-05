// graphql dependencies
import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLFieldConfigMap,
  GraphQLFieldConfig,
  GraphQLScalarType,
  GraphQLList
} from "graphql";
import { GraphQLOutputType, GraphQLUnionType } from "graphql/type";

// services
import { ExecutionContext } from "../service/ExecutionContext";
import { NodeService } from "../service/NodeService";

// models
import {
  MappingPropertyType,
  Mapping,
  MappingProperties,
  MappingProperty,
  MappingNestedProperty,
  MappingNodeProperty,
  Mappings
} from "../model/Mapping";

// GraphQL fields definition for typing
type FieldConfig = GraphQLFieldConfig<any, any>;
type FieldsConfig = GraphQLFieldConfigMap<any, any>;

/**
 * Dictionary of GraphQL object types for referencing.
 */
interface IGraphQLObjectTypes {
  [x: string]: GraphQLObjectType | GraphQLScalarType | GraphQLUnionType;
}

/**
 * Process context.
 */
interface IProcessContext {
  objectTypes: IGraphQLObjectTypes;
  rootObjectTypes: GraphQLObjectType[];
  rootFields: () => FieldsConfig;
  queryObjectType?: GraphQLObjectType;
  mutationObjectType?: GraphQLObjectType;
}

/**
 * Wrap a property within a GraphQLList and/or GraphQLNonNull depending on
 * whether the property is multiple and/or mandatory.
 *
 * @param type GraphQL field type
 * @param propertyMandatory Flag whether a property is mandatory
 * @param propertyMultiple Flag whether a property is multiple
 */
function wrapProperty(
  type: GraphQLOutputType,
  propertyMandatory: boolean,
  propertyMultiple: boolean
): GraphQLOutputType {
  if (propertyMultiple) {
    type = new GraphQLList(type);
  }

  if (propertyMandatory) {
    type = new GraphQLNonNull(type);
  }

  return type;
}

/**
 * Maps mapping property types to GraphQL property types.
 *
 * @param objectTypes Dictionary of object types
 * @param propertyType Mapping property type
 * @returns GraphQL property type
 */
function propertyTypeLookup(objectTypes: IGraphQLObjectTypes, propertyType: MappingPropertyType): GraphQLOutputType {
  switch (propertyType) {
    case MappingPropertyType.Text:
      return GraphQLString;
    case MappingPropertyType.Integer:
      return GraphQLInt;
    case MappingPropertyType.Float:
      return GraphQLFloat;
    case MappingPropertyType.Date:
      return GraphQLString;
    case MappingPropertyType.Boolean:
      return GraphQLBoolean;
    default:
      throw new Error(`Mapping property type ${propertyType} is not supported`);
  }
}

/**
 * Process a scalar property as GraphQL field.
 *
 * @param objectTypes Dictionary of object types
 * @param propertyName Property name
 * @param propertyType Mapping property type
 * @param propertyMandatory Flag whether a property is mandatory
 * @param propertyMultiple Flag whether a property is multiple
 * @return GraphQL field configuration
 */
function processScalarProperty(
  objectTypes: IGraphQLObjectTypes,
  propertyName: string,
  propertyType: MappingPropertyType,
  propertyMandatory: boolean,
  propertyMultiple: boolean
): FieldConfig {
  return {
    type: wrapProperty(propertyTypeLookup(objectTypes, propertyType), propertyMandatory, propertyMultiple),
    resolve(node) {
      // TODO handle property value by type
      return node.properties[propertyName];
    }
  };
}

/**
 * Process a nested property as GraphQL field.
 *
 * @param objectTypes Dictionary of object types
 * @param propertyName Property name
 * @param properties Nested properties
 * @param propertyMandatory Flag whether a property is mandatory
 * @param propertyMultiple Flag whether a property is multiple
 * @return GraphQL field configuration
 */
function processNestedProperty(
  objectTypes: IGraphQLObjectTypes,
  mappingName: string,
  propertyName: string,
  properties: MappingProperties,
  propertyMandatory: boolean = false,
  propertyMultiple: boolean = false
): FieldConfig {
  const name = `${mappingName}_${propertyName}`;
  const objectType = new GraphQLObjectType({
    name,
    fields: processProperties(objectTypes, name, properties, false)
  });

  return {
    type: wrapProperty(objectType, propertyMandatory, propertyMultiple),
    resolve(node) {
      return node.properties[propertyName];
    }
  };
}

/**
 * Process a node reference property as GraphQL field.
 *
 * @param objectTypes Dictionary of object types
 * @param propertyName Property name
 * @param mappingName Mapping name
 * @param propertyMandatory Flag whether a property is mandatory
 * @param propertyMultiple Flag whether a property is multiple
 * @returns GraphQL field configuration
 */
// function processNodeProperty(
//   objectTypes: IGraphQLObjectTypes,
//   mappingName: string,
//   propertyMandatory: boolean = false,
//   propertyMultiple: boolean = false
// ): FieldConfig {
//   return {
//     type: wrapProperty(objectTypes[mappingName], propertyMandatory, propertyMultiple),
//     resolve(node, _, ctx) {
//       return NodeService.get(ctx, node[mappingName]);
//     }
//   };
// }

/**
 * Process a mapping property as GraphQL field.
 *
 * @param objectTypes Dictionary of object types
 * @param mappingName Mapping name
 * @param propertyName Mapping property name
 * @param property Mapping property
 * @returns GraphQL field configuration
 */
function processProperty(
  objectTypes: IGraphQLObjectTypes,
  mappingName: string,
  propertyName: string,
  property: MappingProperty
): FieldConfig {
  // TODO mandatory and multiple properties
  switch (property.type) {
    case MappingPropertyType.Nested:
      return processNestedProperty(
        objectTypes,
        mappingName,
        propertyName,
        (property as MappingNestedProperty).properties,
        property.mandatory,
        property.multiple
      );
    // case MappingPropertyType.Node:
    //   return processNodeProperty(
    //     objectTypes,
    //     (property as MappingNodeProperty).mapping,
    //     property.mandatory,
    //     property.multiple
    //   );
    default:
      return processScalarProperty(objectTypes, propertyName, property.type, property.mandatory, property.multiple);
  }
}

/**
 * Process mapping properties as GraphQL fields.
 *
 * @param objectTypes Dictionary of object types
 * @param mappingName Mapping name
 * @param properties Mapping properties
 * @returns GraphQL fields configuration
 */
function processProperties(
  objectTypes: IGraphQLObjectTypes,
  mappingName: string,
  properties: MappingProperties,
  isTopLevel: boolean
): () => FieldsConfig {
  return () => {
    const fields: FieldsConfig = {};

    if (isTopLevel) {
      // top level properties
      fields.uuid = {
        type: new GraphQLNonNull(GraphQLString)
      };
    }

    // mapping properties
    Object.keys(properties).forEach((propertyName) => {
      fields[propertyName] = processProperty(objectTypes, mappingName, propertyName, properties[propertyName]);
    });

    return fields;
  };
}

/**
 * Process a mapping as a GraphQL field.
 *
 * @param objectTypes Dictionary of object types
 * @param mapping Mapping
 * @return GraphQL field configuration
 */
function processMapping(objectTypes: IGraphQLObjectTypes, mapping: Mapping): FieldConfig {
  // process mapping properties as GraphQL fields
  const fields = processProperties(objectTypes, mapping.name, mapping.properties, true);

  // build a GraphQL object type for this mapping type
  const objectType = new GraphQLObjectType({
    name: mapping.name,
    fields,
    isTypeOf: (value) => value.mapping === mapping.name
  });

  // add object type to objectTypes for later references
  objectTypes[mapping.name] = objectType;

  // return a GraphQL field configuration for this mapping
  return {
    type: objectType,
    args: {
      uuid: { type: GraphQLString }
    },
    resolve(_, { uuid }, ctx) {
      return NodeService.get(ctx, uuid);
    }
  };
}

/**
 * Process list of mappings as GraphQL fields.
 *
 * @param mappings Mappings dictionary
 * @returns GraphQL fields config
 */
function processMappings(mappings: Mappings): IProcessContext {
  const objectTypes: IGraphQLObjectTypes = {};
  const rootObjectTypes: GraphQLObjectType[] = Array<GraphQLObjectType>();

  const rootFields: () => FieldsConfig = () => {
    const fields: FieldsConfig = {};

    // iterate over each mapping and process them
    Object.keys(mappings).forEach((name) => {
      const rootField = processMapping(objectTypes, mappings[name]);
      fields[name] = rootField;
      rootObjectTypes.push(rootField.type as GraphQLObjectType);
    });

    const nodeTypeName = "Node";
    const nodePropertiesTypeName = "NodeProperties";

    const nodePropertiesType = new GraphQLScalarType({
      name: nodePropertiesTypeName,
      serialize(value) {
        return value;
      }
    });

    let nodeObjectType;
    if (rootObjectTypes.length > 0) {
      nodeObjectType = new GraphQLUnionType({
        name: nodeTypeName,
        types: rootObjectTypes
      });
    } else {
      nodeObjectType = new GraphQLObjectType({
        name: nodeTypeName,
        fields: {
          uuid: {
            type: new GraphQLNonNull(GraphQLString)
          },
          mapping: {
            type: new GraphQLNonNull(GraphQLString)
          },
          properties: {
            type: new GraphQLNonNull(nodePropertiesType)
          }
        }
      });
    }

    // add node type to dictionary
    objectTypes[nodePropertiesTypeName] = nodePropertiesType;
    objectTypes[nodeTypeName] = nodeObjectType;

    fields[nodeTypeName] = {
      type: nodeObjectType,
      args: {
        uuid: { type: GraphQLString }
      },
      resolve(_, { uuid }, ctx) {
        return NodeService.get(ctx, uuid);
      }
    };

    return fields;
  };

  // create context
  return { objectTypes, rootObjectTypes, rootFields };
}

/**
 * Generate "Query" type from processed mappings.
 *
 * @param context Process context
 * @returns Process context
 */
function generateQueryType(context: IProcessContext): IProcessContext {
  const queryType = new GraphQLObjectType({
    name: "Query",
    fields: context.rootFields
  });

  context.queryObjectType = queryType;

  return context;
}

/**
 * Generate "Mutation" type from processed mappings.
 *
 * @param context Process context
 * @returns Process context
 */
function generateMutationType(context: IProcessContext): IProcessContext {
  const mutationType = new GraphQLObjectType({
    name: "Mutation",
    fields: () => ({
      createNode: {
        type: context.objectTypes.Node,
        args: {
          mappingName: { type: new GraphQLNonNull(GraphQLString) },
          properties: { type: new GraphQLNonNull(context.objectTypes.NodeProperties) }
        },
        resolve: (_, { mappingName, properties }, ctx) => {
          return NodeService.create(ctx, mappingName, properties);
        }
      }
    })
  });

  context.mutationObjectType = mutationType;

  return context;
}

/**
 * Generate a GraphQL from processed mappings.
 *
 * @param context Process context
 * @returns GraphQL schema
 */
function generateGraphqlSchema(context: IProcessContext): GraphQLSchema {
  return new GraphQLSchema({
    query: context.queryObjectType,
    mutation: context.mutationObjectType
  });
}

/**
 * Get a GraphQL schema from mapping service.
 *
 * @returns GraphQL schema
 */
function mappingsToGraphql(mappings: Mappings): Promise<GraphQLSchema> {
  return Promise.resolve(mappings)
    .then(processMappings)
    .then(generateQueryType)
    .then(generateMutationType)
    .then(generateGraphqlSchema);
}

export default mappingsToGraphql;
