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
import { NodeReader } from "../reader/NodeReader";
import { NodeWriter } from "../writer/NodeWriter";

// models
import {
  MappingPropertyType,
  Mapping,
  MappingProperties,
  MappingProperty,
  MappingNestedProperty,
  Mappings,
  MappingNodeProperty,
  MappingResourceProperty
} from "../model/Mapping";
import { HRNPattern } from "../model/HRN";

// GraphQL fields definition for typing
type FieldConfig = GraphQLFieldConfig<any, any>;
type FieldConfigF = () => FieldConfig;
type FieldsConfig = GraphQLFieldConfigMap<any, any>;
type FieldsConfigF = () => FieldsConfig;

/**
 * Dictionary of GraphQL object types for referencing.
 */
interface GraphQLObjectTypesDic {
  [x: string]: GraphQLObjectType | GraphQLScalarType | GraphQLUnionType;
}

export class MappingsToGraphQLSchemaMapper {
  private _allTypes: GraphQLObjectTypesDic = {};
  private _rootTypes: GraphQLObjectType[] = Array<GraphQLObjectType>();
  private _rootQueryFields: FieldsConfigF;

  /**
   * Wrap a property within a GraphQLList and/or GraphQLNonNull depending on
   * whether the property is multiple and/or mandatory.
   *
   * @param type GraphQL field type
   * @param propertyMandatory Flag whether a property is mandatory
   * @param propertyMultiple Flag whether a property is multiple
   */
  private wrapProperty(
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
   * @param propertyType Mapping property type
   * @returns GraphQL property type
   */
  private scalarPropertyLookup(propertyType: MappingPropertyType): GraphQLOutputType {
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
  private mapScalarProperty(
    propertyName: string,
    propertyType: MappingPropertyType,
    propertyMandatory: boolean,
    propertyMultiple: boolean
  ): FieldConfig {
    return {
      type: this.wrapProperty(this.scalarPropertyLookup(propertyType), propertyMandatory, propertyMultiple),
      resolve(node) {
        return node.properties[propertyName];
      }
    };
  }

  /**
   * Process a nested property as GraphQL field.
   *
   * @param propertyName Property name
   * @param properties Nested properties
   * @param propertyMandatory Flag whether a property is mandatory
   * @param propertyMultiple Flag whether a property is multiple
   * @return GraphQL field configuration
   */
  private mapNestedProperty(
    mappingName: string,
    propertyName: string,
    properties: MappingProperties,
    propertyMandatory: boolean = false,
    propertyMultiple: boolean = false
  ): FieldConfig {
    const name = `${mappingName}_${propertyName}`;
    const objectType = new GraphQLObjectType({
      name,
      fields: this.mapProperties(name, properties, false)
    });

    return {
      type: this.wrapProperty(objectType, propertyMandatory, propertyMultiple),
      resolve(node) {
        return node.properties[propertyName];
      }
    };
  }

  /**
   * Process a node reference property as GraphQL field.
   *
   * @param mappingName Mapping name
   * @param propertyMandatory Flag whether a property is mandatory
   * @param propertyMultiple Flag whether a property is multiple
   * @returns GraphQL field configuration
   */
  private mapNodeProperty(
    mappingName: string,
    propertyMandatory: boolean = false,
    propertyMultiple: boolean = false
  ): FieldConfig {
    return {
      type: this.wrapProperty(this._allTypes[mappingName], propertyMandatory, propertyMultiple),
      resolve(nodeHrn, _, ctx) {
        let nodeId = null;
        if (HRNPattern.test(nodeHrn)) {
          const m = nodeHrn.match(HRNPattern);
          nodeId = m[2] || null;
        }

        return NodeReader.get(ctx, nodeId).then((nodeOpt) => {
          return nodeOpt.getOrElse(null);
        });
      }
    };
  }

  /**
   * Process a resource reference property as GraphQL field.
   *
   * @param propertyName Property name
   * @param mappingName Mapping name
   * @param propertyMandatory Flag whether a property is mandatory
   * @param propertyMultiple Flag whether a property is multiple
   * @returns GraphQL field configuration
   */
  // private processResource(
  //   objectTypes: IGraphQLObjectTypes,
  //   mappingName: string,
  //   propertyMandatory: boolean = false,
  //   propertyMultiple: boolean = false
  // ): FieldConfig {
  //   return {
  //     type: wrapProperty(objectTypes[mappingName], propertyMandatory, propertyMultiple),
  //     resolve(node, _, ctx) {
  //       return ResourceReader.get(ctx, node[mappingName]);
  //     }
  //   };
  // }

  /**
   * Process a mapping property as GraphQL field.
   *
   * @param mappingName Mapping name
   * @param propertyName Mapping property name
   * @param property Mapping property
   * @returns GraphQL field configuration
   */
  private mapProperty(mappingName: string, propertyName: string, property: MappingProperty): FieldConfig {
    switch (property.type) {
      case MappingPropertyType.Nested:
        return this.mapNestedProperty(
          mappingName,
          propertyName,
          (property as MappingNestedProperty).properties,
          property.mandatory,
          property.multiple
        );
      case MappingPropertyType.Node:
        return this.mapNodeProperty((property as MappingNodeProperty).mapping, property.mandatory, property.multiple);
      // case MappingPropertyType.Resource:
      //   return processResource(
      //     objectTypes,
      //     (property as MappingResourceProperty).kind,
      //     property.mandatory,
      //     property.multiple
      //   );
      default:
        return this.mapScalarProperty(propertyName, property.type, property.mandatory, property.multiple);
    }
  }

  /**
   * Process mapping properties as GraphQL fields.
   *
   * @param mappingName Mapping name
   * @param properties Mapping properties
   * @returns GraphQL fields configuration
   */
  private mapProperties(mappingName: string, properties: MappingProperties, isTopLevel: boolean): FieldsConfigF {
    return () => {
      const fields: FieldsConfig = {};

      if (isTopLevel) {
        // top level node properties
        fields.nodeId = {
          type: new GraphQLNonNull(GraphQLString)
        };
      }

      // mapping properties
      Object.keys(properties).forEach((propertyName) => {
        fields[propertyName] = this.mapProperty(mappingName, propertyName, properties[propertyName]);
      });

      return fields;
    };
  }

  /**
   * Process a mapping as a GraphQL field.
   *
   * @param mapping Mapping
   * @return GraphQL field configuration
   */
  private mapMapping(mapping: Mapping): FieldConfig {
    // process mapping properties as GraphQL fields
    const fields = this.mapProperties(mapping.name, mapping.properties, true);

    // build a GraphQL object type for this mapping type
    const objectType = new GraphQLObjectType({
      name: mapping.name,
      fields,
      isTypeOf: (value) => value.mapping === mapping.name
    });

    // add object type to objectTypes for later references
    this._allTypes[mapping.name] = objectType;

    // return a GraphQL field configuration for this mapping
    return {
      type: objectType,
      args: {
        nodeId: { type: GraphQLString }
      },
      resolve(_, { nodeId }, ctx) {
        return NodeReader.get(ctx, nodeId).then((nodeOpt) => {
          return nodeOpt.getOrElse(null);
        });
      }
    };
  }

  /**
   * Process list of mappings as GraphQL fields.
   *
   * @param mappings Mappings dictionary
   * @returns GraphQL fields config
   */
  private loadMappings(mappings: Mappings): void {
    this._rootQueryFields = () => {
      const fields: FieldsConfig = {};

      // iterate over each mapping and process them
      Object.keys(mappings).forEach((mappingName) => {
        const rootQueryField = this.mapMapping(mappings[mappingName]);
        fields[mappingName] = rootQueryField;
        this._rootTypes.push(rootQueryField.type as GraphQLObjectType);
      });

      // Add NodeProperties type
      const nodePropertiesTypeName = "NodeProperties";
      const nodePropertiesType = new GraphQLScalarType({
        name: nodePropertiesTypeName,
        serialize(value) {
          return value;
        }
      });
      this._allTypes[nodePropertiesTypeName] = nodePropertiesType;

      // if (rootObjectTypes.length > 0) {
      //   nodeObjectType = new GraphQLUnionType({
      //     name: nodeTypeName,
      //     types: rootObjectTypes
      //   });
      // }
      // Add Node type
      const nodeTypeName = "Node";
      const nodeObjectType = new GraphQLObjectType({
        name: nodeTypeName,
        fields: {
          nodeId: {
            type: new GraphQLNonNull(GraphQLString)
          },
          mappingName: {
            type: new GraphQLNonNull(GraphQLString)
          },
          properties: {
            type: new GraphQLNonNull(nodePropertiesType)
          }
        }
      });
      this._allTypes[nodeTypeName] = nodeObjectType;

      // add node type as root query field
      fields[nodeTypeName] = {
        type: nodeObjectType,
        args: {
          nodeId: { type: GraphQLString }
        },
        resolve(_, { nodeId }, ctx) {
          return NodeReader.get(ctx, nodeId).then((nodeOpt) => {
            return nodeOpt.getOrElse(null);
          });
        }
      };

      return fields;
    };
  }

  /**
   * Generate "Query" type from processed mappings.
   *
   * @returns Process context
   */
  private generateQueryType(): GraphQLObjectType {
    const queryType = new GraphQLObjectType({
      name: "Query",
      fields: this._rootQueryFields
    });

    return queryType;
  }

  /**
   * Generate "Mutation" type from processed mappings.
   *
   * @returns Process context
   */
  private generateMutationType(): GraphQLObjectType {
    const mutationType = new GraphQLObjectType({
      name: "Mutation",
      fields: () => ({
        createNode: {
          type: this._allTypes.Node,
          args: {
            mappingName: { type: new GraphQLNonNull(GraphQLString) },
            properties: { type: new GraphQLNonNull(this._allTypes.NodeProperties) }
          },
          resolve: (_, { mappingName, properties }, ctx) => {
            return NodeWriter.create(ctx, mappingName, properties);
          }
        }
      })
    });

    return mutationType;
  }

  /**
   * Generate a GraphQL from processed mappings.
   *
   * @returns GraphQL schema
   */
  private generateGraphqlSchema(): GraphQLSchema {
    return new GraphQLSchema({
      query: this.generateQueryType(),
      mutation: this.generateMutationType()
    });
  }

  /**
   * Get a GraphQL schema from mapping service.
   *
   * @returns GraphQL schema
   */
  public map(mappings: Mappings): GraphQLSchema {
    this.loadMappings(mappings);
    return this.generateGraphqlSchema();
  }
}
