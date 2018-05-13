import { Schema, Validator } from "jsonschema";
import {
  IMapping,
  IMappingProperties,
  IMappingProperty,
  IMappingPropertyType,
  IMappingNestedProperty
} from "../model/IMapping";
import { AuditSchema } from "./schemas/Audit";
import { NodePropertiesSchema, NodePropertySchema } from "./schemas/Node";

interface IPropertiesOutput {
  properties: {};
  required: string[];
}

function processScalarProperty(property: IMappingProperty): Schema {
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
    case IMappingPropertyType.Node:
      return {
        type: "string",
        pattern: "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
      };
    default:
      throw new Error(`Mapping property type ${property.type} is not supported`);
  }
}

function processNestedProperty(property: IMappingNestedProperty): Schema {
  const { properties, required } = processProperties(property.properties);

  return {
    type: "object",
    properties,
    required
  };
}

function processProperty(propertyName: string, property: IMappingProperty): Schema {
  switch (property.type) {
    case IMappingPropertyType.Nested:
      return processNestedProperty(property);
    default:
      return processScalarProperty(property);
  }
}

function processProperties(properties: IMappingProperties): IPropertiesOutput {
  const schemaProperties = {};
  const requiredProperties = [];
  Object.keys(properties).forEach((propertyName) => {
    schemaProperties[propertyName] = processProperty(propertyName, properties[propertyName]);
    if (properties[propertyName].mandatory) {
      requiredProperties.push(propertyName);
    }
  });

  return {
    properties: schemaProperties,
    required: requiredProperties
  };
}

export default class NodeValidation {
  private static getNodeValidator(nodePropertiesSchema: Schema): Validator {
    // create validator with custom node schema
    const validator = new Validator();
    validator.addSchema(AuditSchema, AuditSchema.id);
    validator.addSchema(NodePropertySchema, NodePropertySchema.id);
    validator.addSchema(nodePropertiesSchema, NodePropertiesSchema.id);

    return validator;
  }

  public static getDefaultNodeValidator(): Validator {
    return this.getNodeValidator(NodePropertiesSchema);
  }

  public static getNodeValidatorFromMapping(mapping?: IMapping): Validator {
    return this.getNodeValidator(this.mappingToNodePropertiesSchema(mapping));
  }

  public static mappingToNodePropertiesSchema(mapping: IMapping): Schema {
    const { properties, required } = processProperties(mapping.properties);

    return {
      id: "/NodeProperties",
      type: "object",
      properties,
      required
    };
  }
}
