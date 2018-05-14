import { INodeProperties, INodePropertyType } from "../model/INode";
import {
  IMapping,
  MappingBuilder,
  IMappingProperties,
  IMappingProperty,
  IMappingPropertyType,
  IMappingNestedProperty
} from "../model/IMapping";

import * as moment from "moment";

/**
 * Node to mapping generator.
 */
export default class NodePropertiesMappingGenerator {
  /**
   * Generate a mapping out of node properties.
   *
   * @param {string} mappingName - Mapping name
   * @param {INodeProperties} nodeProperties - Node properties
   * @returns {IMapping} Mapping
   */
  public static toMapping(mappingName: string, nodeProperties: INodeProperties): IMapping {
    return new MappingBuilder()
      .name(mappingName)
      .properties(this.processNodeProperties(nodeProperties))
      .build();
  }

  /**
   * Process node properties as mapping properties.
   *
   * @param nodeProperties - Node properties
   * @returns {IMappingProperties} Mapping properties
   */
  private static processNodeProperties(nodeProperties: INodeProperties): IMappingProperties {
    const mappingProperties: IMappingProperties = {};

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
   * @param {INodePropertyType} nodeProperty - Node property
   * @returns {IMappingProperty} Mapping property
   */
  private static processNodeProperty(nodeProperty: INodePropertyType): IMappingProperty {
    const mandatory = false;
    const multiple = Array.isArray(nodeProperty);

    // if value is an array, then guess the items type
    const value = multiple ? nodeProperty[0] : nodeProperty;

    // ignore null values
    if (value === null) {
      return null;
    }

    let type = IMappingPropertyType.Text;
    if (typeof value === "number") {
      type = this.guessNumberValue(value);
    } else if (typeof value === "string") {
      type = this.guessStringValue(value);
    } else if (typeof value === "boolean") {
      type = IMappingPropertyType.Boolean;
    } else if (typeof value === "object") {
      type = IMappingPropertyType.Nested;
    }

    if (type === IMappingPropertyType.Nested) {
      return {
        type,
        mandatory,
        multiple,
        properties: this.processNodeProperties(nodeProperty as INodeProperties)
      } as IMappingNestedProperty;
    } else {
      return {
        type,
        mandatory,
        multiple
      };
    }
  }

  private static guessStringValue(value: string): IMappingPropertyType {
    return this.isDate(value) ? IMappingPropertyType.Date : IMappingPropertyType.Text;
  }

  private static guessNumberValue(value: number): IMappingPropertyType {
    if (Number.isInteger(value)) {
      return IMappingPropertyType.Integer;
    } else {
      return IMappingPropertyType.Float;
    }
  }

  private static isDate(value: string): boolean {
    return moment(value, moment.ISO_8601).isValid();
  }
}
