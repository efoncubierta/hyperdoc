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
import { NodeService } from "hyperdoc-core";

import {
  IMappingPropertyType,
  IMapping,
  IMappingProperties,
  IMappingProperty,
  IMappingNestedProperty,
  IMappingNodeProperty,
  IMappings
} from "hyperdoc-core/dist/model/IMapping";
import { IExecutionContext } from "hyperdoc-core/dist/model/IExecutionContext";

// GraphQL fields definition for typing
type FieldConfig = GraphQLFieldConfig<any, any>;
type FieldsConfig = GraphQLFieldConfigMap<any, any>;

/**
 * Dictionary of GraphQL object types for referencing.
 */
interface IGraphQLObjectTypes {
  [x: string]: GraphQLObjectType | GraphQLUnionType;
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
 * @param {GraphQLOutputType} type - GraphQL field type
 * @param {boolean} propertyMandatory - Flag whether a property is mandatory
 * @param {boolean} propertyMultiple - Flag whether a property is multiple
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
 * @param {IGraphQLObjectTypes} objectTypes - Dictionary of object types
 * @param {IMappingPropertyType} propertyType - Mapping property type
 * @returns {GraphQLOutputType} GraphQL property type
 */
function propertyTypeLookup(objectTypes: IGraphQLObjectTypes, propertyType: IMappingPropertyType): GraphQLOutputType {
  switch (propertyType) {
    case IMappingPropertyType.Text:
      return GraphQLString;
    case IMappingPropertyType.Integer:
      return GraphQLInt;
    case IMappingPropertyType.Float:
      return GraphQLFloat;
    case IMappingPropertyType.Date:
      return GraphQLString;
    case IMappingPropertyType.Boolean:
      return GraphQLBoolean;
    default:
      throw new Error(`Mapping property type ${propertyType} is not supported`);
  }
}

/**
 * Process a scalar property as GraphQL field.
 *
 * @param {IGraphQLObjectTypes} objectTypes - Dictionary of object types
 * @param {string} propertyName - Property name
 * @param {IMappingPropertyType} propertyType - Mapping property type
 * @param {boolean} propertyMandatory - Flag whether a property is mandatory
 * @param {boolean} propertyMultiple - Flag whether a property is multiple
 * @return {FieldConfig} GraphQL field configuration
 */
function processScalarProperty(
  objectTypes: IGraphQLObjectTypes,
  propertyName: string,
  propertyType: IMappingPropertyType,
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
 * @param {IGraphQLObjectTypes} objectTypes - Dictionary of object types
 * @param {string} propertyName - Property name
 * @param {string} properties - Nested properties
 * @param {boolean} propertyMandatory - Flag whether a property is mandatory
 * @param {boolean} propertyMultiple - Flag whether a property is multiple
 * @return {FieldConfig} GraphQL field configuration
 */
function processNestedProperty(
  objectTypes: IGraphQLObjectTypes,
  mappingName: string,
  propertyName: string,
  properties: IMappingProperties,
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
 * @param {IGraphQLObjectTypes} objectTypes - Dictionary of object types
 * @param {string} propertyName - Property name
 * @param {string} mappingName - Mapping name
 * @param {boolean} propertyMandatory - Flag whether a property is mandatory
 * @param {boolean} propertyMultiple - Flag whether a property is multiple
 * @returns {FieldConfig} GraphQL field configuration
 */
function processNodeProperty(
  objectTypes: IGraphQLObjectTypes,
  mappingName: string,
  propertyMandatory: boolean = false,
  propertyMultiple: boolean = false
): FieldConfig {
  return {
    type: wrapProperty(objectTypes[mappingName], propertyMandatory, propertyMultiple),
    resolve(node, _, ctx) {
      return NodeService.get(ctx, node[mappingName]);
    }
  };
}

/**
 * Process a mapping property as GraphQL field.
 *
 * @param {IGraphQLObjectTypes} objectTypes - Dictionary of object types
 * @param {string} mappingName - Mapping name
 * @param {string} propertyName - Mapping property name
 * @param {IMappingProperty} property - Mapping property
 * @returns {FieldConfig} GraphQL field configuration
 */
function processProperty(
  objectTypes: IGraphQLObjectTypes,
  mappingName: string,
  propertyName: string,
  property: IMappingProperty
): FieldConfig {
  // TODO mandatory and multiple properties
  switch (property.type) {
    case IMappingPropertyType.Nested:
      return processNestedProperty(
        objectTypes,
        mappingName,
        propertyName,
        (property as IMappingNestedProperty).properties,
        property.mandatory,
        property.multiple
      );
    case IMappingPropertyType.Node:
      return processNodeProperty(
        objectTypes,
        (property as IMappingNodeProperty).mapping,
        property.mandatory,
        property.multiple
      );
    default:
      return processScalarProperty(objectTypes, propertyName, property.type, property.mandatory, property.multiple);
  }
}

/**
 * Process mapping properties as GraphQL fields.
 *
 * @param {IGraphQLObjectTypes} objectTypes - Dictionary of object types
 * @param {string} mappingName - Mapping name
 * @param {IMappingProperties} properties - Mapping properties
 * @returns {FieldsConfig} GraphQL fields configuration
 */
function processProperties(
  objectTypes: IGraphQLObjectTypes,
  mappingName: string,
  properties: IMappingProperties,
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
 * @param {IGraphQLObjectTypes} objectTypes - Dictionary of object types
 * @param {IMapping} mapping - Mapping
 * @return {FieldConfig} GraphQL field configuration
 */
function processMapping(objectTypes: IGraphQLObjectTypes, mapping: IMapping): FieldConfig {
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
 * @param {IMappings} mappings - Mappings dictionary
 * @returns {FieldsConfig} GraphQL fields config
 */
function processMappings(mappings: IMappings): IProcessContext {
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

    const nodeObjectType = new GraphQLUnionType({
      name: nodeTypeName,
      types: rootObjectTypes
    });

    // add node type to dictionary
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
 * @param {IProcessContext} context - Process context
 * @returns {IProcessContext} Process context
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
 * @param {IProcessContext} context - Process context
 * @returns {IProcessContext} Process context
 */
function generateMutationType(context: IProcessContext): IProcessContext {
  const NodeProperties = new GraphQLScalarType({
    name: "NodeProperties",
    serialize(value) {
      return value;
    }
  });

  const mutationType = new GraphQLObjectType({
    name: "Mutation",
    fields: () => ({
      createNode: {
        type: context.objectTypes.Node,
        args: {
          mappingName: { type: new GraphQLNonNull(GraphQLString) },
          properties: { type: new GraphQLNonNull(NodeProperties) }
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
 * @param {IProcessContext} context - Process context
 * @returns {GraphQLSchema} GraphQL schema
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
 * @returns {Promise<GraphQLSchema>} GraphQL schema
 */
function mappingsToGraphql(mappings: IMappings): Promise<GraphQLSchema> {
  return Promise.resolve(mappings)
    .then(processMappings)
    .then(generateQueryType)
    .then(generateMutationType)
    .then(generateGraphqlSchema);
}

export default mappingsToGraphql;
