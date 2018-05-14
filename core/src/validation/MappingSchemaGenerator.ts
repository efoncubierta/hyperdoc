import {
  IMapping,
  IMappingProperty,
  IMappingPropertyType,
  IMappingNestedProperty,
  IMappingProperties
} from "../model/IMapping";
import { Schema } from "jsonschema";
import { NodePropertiesSchema } from "./schemas/Node";

interface IPropertiesOutput {
  properties: {};
  required: string[];
}

export default class MappingSchemaGenerator {
  /**
   * Generate a JSON schema for node properties out of a mapping.
   *
   * @param mapping - Mapping
   * @returns {Schema} JSON schema represting the mappings as node properties.
   */
  public static toNodePropertiesSchema(mapping: IMapping): Schema {
    const { properties, required } = this.processMappingProperties(mapping.properties);

    return {
      id: NodePropertiesSchema.id,
      type: NodePropertiesSchema.type,
      properties,
      required
    };
  }

  /**
   * Process a scalar mapping property as a JSON schema.
   *
   * @param {IMappingProperty} property - Mapping property
   * @returns {Schema} JSON schema for the scalar mapping property
   */
  private static processMappingScalarProperty(property: IMappingProperty): Schema {
    switch (property.type) {
      case IMappingPropertyType.Boolean:
        return {
          type: "boolean"
        };
      case IMappingPropertyType.Date:
        return {
          type: "string",
          format: "date-time"
        };
      case IMappingPropertyType.Text:
        return {
          type: "string"
        };
      case IMappingPropertyType.Integer:
      case IMappingPropertyType.Float:
        return {
          type: "number"
        };
      default:
        throw new Error(`Mapping property type ${property.type} is not supported`);
    }
  }

  /**
   * Process a nested mapping property as a JSON schema.
   *
   * @param {IMappingNestedProperty} property - Mapping property
   * @returns {Schema} JSON schema representation for the nested mapping property
   */
  private static processMappingNestedProperty(property: IMappingNestedProperty): Schema {
    const { properties, required } = this.processMappingProperties(property.properties);

    return {
      type: "object",
      properties,
      required
    } as Schema;
  }

  /**
   * Wrap a JSON schema property depending on whether the property is multi-valued.
   *
   * @param propertySchema - JSON schema of a mapping property
   * @param multiple - Flag whether the property is multi-valued or not
   * @returns {Schema} Wrapped JSON schema
   */
  private static wrapPropertySchema(propertySchema: Schema, multiple: boolean): Schema {
    if (multiple) {
      return {
        type: "array",
        items: propertySchema
      } as Schema;
    }

    return propertySchema;
  }

  /**
   * Process a mapping property as a JSON schema.
   *
   * @param {string} propertyName - Mapping property name
   * @param {IMappingProperty} property - Mapping property
   * @returns {Schema} JSON schema representation of the mapping property
   */
  private static processMappingProperty(propertyName: string, property: IMappingProperty): Schema {
    switch (property.type) {
      case IMappingPropertyType.Nested:
        return this.wrapPropertySchema(this.processMappingNestedProperty(property), property.multiple);
      default:
        return this.wrapPropertySchema(this.processMappingScalarProperty(property), property.multiple);
    }
  }

  /**
   * Process a dictionary of mapping properties.
   *
   * @param {IMappingProperties} properties - Mapping properties dictionary
   * @returns {IPropertiesOutput} JSON schema representation of the mapping properties and list of required properties
   */
  private static processMappingProperties(properties: IMappingProperties): IPropertiesOutput {
    const schemaProperties = {};
    const requiredProperties = [];

    Object.keys(properties).forEach((propertyName) => {
      schemaProperties[propertyName] = this.processMappingProperty(propertyName, properties[propertyName]);
      if (properties[propertyName].mandatory) {
        requiredProperties.push(propertyName);
      }
    });

    return {
      properties: schemaProperties,
      required: requiredProperties
    };
  }
}
