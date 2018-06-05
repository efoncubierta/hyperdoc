import * as moment from "moment";
import {
  Mapping,
  MappingProperties,
  MappingProperty,
  MappingPropertyType,
  MappingNestedProperty,
  MappingId
} from "../model/Mapping";
import { NodeProperties, NodePropertyType, NodePropertiesArray } from "../model/Node";
import { Option, none, some } from "fp-ts/lib/Option";

/**
 * Node to mapping generator.
 */
export class NodePropertiesMappingGenerator {
  /**
   * Generate a mapping out of node properties.
   *
   * @param mappingName Mapping name
   * @param nodeProperties Node properties
   * @returns Mapping
   */
  public static toMapping(mappingId: MappingId, mappingName: string, nodeProperties: NodeProperties): Mapping {
    return {
      id: mappingId,
      name: mappingName,
      properties: this.processNodeProperties(nodeProperties)
    };
  }

  /**
   * Process node properties as mapping properties.
   *
   * @param nodeProperties Node properties
   * @returns Mapping properties
   */
  private static processNodeProperties(nodeProperties: NodeProperties): MappingProperties {
    const mappingProperties: MappingProperties = {};

    Object.keys(nodeProperties).forEach((propertyName) => {
      const mappingPropertyOpt = this.processNodeProperty(nodeProperties[propertyName]);
      mappingPropertyOpt.mapNullable((mappingProperty) => {
        mappingProperties[propertyName] = mappingProperty;
      });
    });

    return mappingProperties;
  }

  /**
   * Process a node property as a mapping property.
   *
   * @param nodeProperty Node property
   * @returns Mapping property
   */
  private static processNodeProperty(nodeProperty: NodePropertyType): Option<MappingProperty> {
    const mandatory = false;
    const multiple = Array.isArray(nodeProperty);

    // if value is an array, then guess the items type
    const value = multiple ? (nodeProperty as NodePropertiesArray)[0] : nodeProperty;

    // ignore null values
    if (value === null) {
      return none;
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
      return some({
        type,
        mandatory,
        multiple,
        properties: this.processNodeProperties(nodeProperty as NodeProperties)
      } as MappingNestedProperty);
    } else {
      return some({
        type,
        mandatory,
        multiple
      });
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
