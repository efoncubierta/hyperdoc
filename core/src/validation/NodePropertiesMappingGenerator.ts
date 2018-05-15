import { NodeProperties, NodePropertyType } from "../model/Node";
import {
  Mapping,
  MappingBuilder,
  MappingProperties,
  MappingProperty,
  MappingPropertyType,
  MappingNestedProperty
} from "../model/Mapping";

import * as moment from "moment";

/**
 * Node to mapping generator.
 */
export default class NodePropertiesMappingGenerator {
  /**
   * Generate a mapping out of node properties.
   *
   * @param {string} mappingName - Mapping name
   * @param {NodeProperties} nodeProperties - Node properties
   * @returns {Mapping} Mapping
   */
  public static toMapping(mappingName: string, nodeProperties: NodeProperties): Mapping {
    return new MappingBuilder()
      .name(mappingName)
      .properties(this.processNodeProperties(nodeProperties))
      .build();
  }

  /**
   * Process node properties as mapping properties.
   *
   * @param nodeProperties - Node properties
   * @returns {MappingProperties} Mapping properties
   */
  private static processNodeProperties(nodeProperties: NodeProperties): MappingProperties {
    const mappingProperties: MappingProperties = {};

    Object.keys(nodeProperties).forEach((propertyName) => {
      const mappingProperty = this.processNodeProperty(nodeProperties[propertyName]);
      // ignore null values
      if (mappingProperty) {
        mappingProperties[propertyName] = mappingProperty;
      }
    });

    return mappingProperties;
  }

  /**
   * Process a node property as a mapping property.
   *
   * @param {NodePropertyType} nodeProperty - Node property
   * @returns {MappingProperty} Mapping property
   */
  private static processNodeProperty(nodeProperty: NodePropertyType): MappingProperty {
    const mandatory = false;
    const multiple = Array.isArray(nodeProperty);

    // if value is an array, then guess the items type
    const value = multiple ? nodeProperty[0] : nodeProperty;

    // ignore null values
    if (value === null) {
      return null;
    }

    let type = MappingPropertyType.Text;
    if (typeof value === "number") {
      type = this.guessNumberValue(value);
    } else if (typeof value === "string") {
      type = this.guessStringValue(value);
    } else if (typeof value === "boolean") {
      type = MappingPropertyType.Boolean;
    } else if (typeof value === "object") {
      type = MappingPropertyType.Nested;
    }

    if (type === MappingPropertyType.Nested) {
      return {
        type,
        mandatory,
        multiple,
        properties: this.processNodeProperties(nodeProperty as NodeProperties)
      } as MappingNestedProperty;
    } else {
      return {
        type,
        mandatory,
        multiple
      };
    }
  }

  private static guessStringValue(value: string): MappingPropertyType {
    return this.isDate(value) ? MappingPropertyType.Date : MappingPropertyType.Text;
  }

  private static guessNumberValue(value: number): MappingPropertyType {
    if (Number.isInteger(value)) {
      return MappingPropertyType.Integer;
    } else {
      return MappingPropertyType.Float;
    }
  }

  private static isDate(value: string): boolean {
    return moment(value, moment.ISO_8601).isValid();
  }
}
