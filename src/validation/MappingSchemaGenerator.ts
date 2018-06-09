// external dependencies
import { Schema } from "jsonschema";

// models
import {
  Mapping,
  MappingProperty,
  MappingPropertyType,
  MappingNestedProperty,
  MappingProperties
} from "../model/Mapping";

// model schemas
import { NodePropertiesSchema } from "../validation/schemas/NodeSchema";

interface SchemaProperties {
  [x: string]: Schema;
}

interface PropertiesOutput {
  properties: SchemaProperties;
  required: string[];
}

export class MappingSchemaGenerator {
  /**
   * Generate a JSON schema for node properties out of a mapping.
   *
   * @param mapping - Mapping
   * @returns {Schema} JSON schema represting the mappings as node properties.
   */
  public static toNodePropertiesSchema(mapping: Mapping): Schema {
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
   * @param {MappingProperty} property - Mapping property
   * @returns {Schema} JSON schema for the scalar mapping property
   */
  private static processMappingScalarProperty(property: MappingProperty): Schema {
    switch (property.type) {
      case MappingPropertyType.Boolean:
        return {
          type: "boolean"
        };
      case MappingPropertyType.Date:
        return {
          type: "string",
          format: "date-time"
        };
      case MappingPropertyType.Text:
        return {
          type: "string"
        };
      case MappingPropertyType.Integer:
      case MappingPropertyType.Float:
        return {
          type: "number"
        };
      case MappingPropertyType.Node:
        return {
          type: "string",
          pattern: "^hyperdoc:node:[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$"
        };
      case MappingPropertyType.Resource:
        return {
          type: "string",
          pattern: "^hyperdoc:resource:[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$"
        };
      default:
        throw new Error(`Mapping property type ${property.type} is not supported`);
    }
  }

  /**
   * Process a nested mapping property as a JSON schema.
   *
   * @param {MappingNestedProperty} property - Mapping property
   * @returns {Schema} JSON schema representation for the nested mapping property
   */
  private static processMappingNestedProperty(property: MappingNestedProperty): Schema {
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
   * @param {MappingProperty} property - Mapping property
   * @returns {Schema} JSON schema representation of the mapping property
   */
  private static processMappingProperty(propertyName: string, property: MappingProperty): Schema {
    switch (property.type) {
      case MappingPropertyType.Nested:
        return this.wrapPropertySchema(
          this.processMappingNestedProperty(property as MappingNestedProperty),
          property.multiple
        );
      default:
        return this.wrapPropertySchema(this.processMappingScalarProperty(property), property.multiple);
    }
  }

  /**
   * Process a dictionary of mapping properties.
   *
   * @param {MappingProperties} properties - Mapping properties dictionary
   * @returns {PropertiesOutput} JSON schema representation of the mapping properties and list of required properties
   */
  private static processMappingProperties(properties: MappingProperties): PropertiesOutput {
    const schemaProperties: SchemaProperties = {};
    const requiredProperties: string[] = [];

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
