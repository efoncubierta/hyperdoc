import * as faker from "faker";

import NodeValidator from "../../src/validation/NodeValidator";
import { INode, INodeProperties, NodeBuilder, INodePropertyType } from "../../src/model/INode";
import { IAudit } from "../../src/model/IAudit";
import {
  IMapping,
  IMappingPropertyType,
  IMappingNestedProperty,
  IMappingNodeProperty,
  IMappingProperties,
  IMappingProperty
} from "../../src/model/IMapping";
import { IExecutionContext, IAuthenticationContext } from "../../src/model/IExecutionContext";
import NodeInmemoryStore from "../store/inmemory/NodeInmemoryStore";
import MappingInmemoryStore from "../store/inmemory/MappingInmemoryStore";

export default class TestDataGenerator {
  public static fullMapping(): IMapping {
    return {
      uuid: faker.random.uuid(),
      name: faker.random.word(),
      properties: this.fullMappingProperties()
    };
  }

  public static randomMapping(): IMapping {
    return {
      uuid: faker.random.uuid(),
      name: faker.random.word(),
      properties: this.randomMappingProperties()
    };
  }

  public static randomMappingName(): string {
    return faker.random.word().replace(" ", "");
  }

  public static fullMappingProperties(): IMappingProperties {
    return {
      stringProp: {
        type: IMappingPropertyType.Text,
        mandatory: true,
        multiple: false
      },
      multiStringProp: {
        type: IMappingPropertyType.Text,
        mandatory: true,
        multiple: true
      },
      intProp: {
        type: IMappingPropertyType.Integer,
        mandatory: true,
        multiple: false
      },
      multiIntProp: {
        type: IMappingPropertyType.Integer,
        mandatory: true,
        multiple: true
      },
      floatProp: {
        type: IMappingPropertyType.Float,
        mandatory: true,
        multiple: false
      },
      multiFloatProp: {
        type: IMappingPropertyType.Float,
        mandatory: true,
        multiple: true
      },
      boolProp: {
        type: IMappingPropertyType.Boolean,
        mandatory: true,
        multiple: false
      },
      multiBoolProp: {
        type: IMappingPropertyType.Boolean,
        mandatory: true,
        multiple: true
      },
      dateProp: {
        type: IMappingPropertyType.Date,
        mandatory: true,
        multiple: false
      },
      multiDateProp: {
        type: IMappingPropertyType.Date,
        mandatory: true,
        multiple: true
      },
      nestedProp: {
        type: IMappingPropertyType.Nested,
        mandatory: true,
        multiple: false,
        properties: {
          nestedSubprop: {
            type: IMappingPropertyType.Nested,
            mandatory: true,
            multiple: false,
            properties: {
              stringSubprop: {
                type: IMappingPropertyType.Text,
                mandatory: true,
                multiple: false
              }
            }
          }
        }
      } as IMappingNestedProperty
    };
  }

  public static randomMappingPropertyType(): IMappingPropertyType {
    return faker.random.arrayElement([
      IMappingPropertyType.Boolean,
      IMappingPropertyType.Date,
      IMappingPropertyType.Float,
      IMappingPropertyType.Integer,
      IMappingPropertyType.Nested,
      IMappingPropertyType.Text
    ]);
  }

  public static randomMappingPropertyName(): string {
    return faker.random.word().replace(" ", "");
  }

  public static randomMappingProperties(maxDepth: number = 3): IMappingProperties {
    const properties: IMappingProperties = {};
    for (let i = 0; i < faker.random.number(10); i++) {
      const propertyName = this.randomMappingPropertyName();
      const propertyType = this.randomMappingPropertyType();
      const mandatory = faker.random.boolean();
      const multiple = faker.random.boolean();

      // don't go further down if maxDepth <= 0
      if (propertyType === IMappingPropertyType.Nested && maxDepth <= 0) {
        continue;
      }

      switch (propertyType) {
        case IMappingPropertyType.Nested:
          properties[propertyName] = {
            type: propertyType,
            mandatory,
            multiple,
            properties: this.randomMappingProperties(maxDepth - 1)
          } as IMappingNestedProperty;
          return;
        default:
          properties[propertyName] = {
            type: propertyType,
            mandatory,
            multiple
          } as IMappingProperty;
      }
    }

    return properties;
  }

  public static randomFullNode(): INode {
    return new NodeBuilder()
      .uuid(this.randomUUID())
      .mapping(this.randomMappingName())
      .properties(this.randomFullNodeProperties())
      .audit(this.randomAudit())
      .build();
  }

  public static randomNode(): INode {
    return new NodeBuilder()
      .uuid(this.randomUUID())
      .mapping(this.randomMappingName())
      .properties(this.randomNodeProperties())
      .audit(this.randomAudit())
      .build();
  }

  public static randomFullNodeProperties(): INodeProperties {
    return {
      stringProp: faker.random.words(),
      multiStringProp: [faker.random.word(), faker.random.word()],
      intProp: faker.random.number(),
      multiIntProp: [faker.random.number(), faker.random.number()],
      floatProp: faker.random.number({ precision: 0.01 }),
      multiFloatProp: [faker.random.number({ precision: 0.01 }), faker.random.number({ precision: 0.01 })],
      boolProp: faker.random.boolean(),
      multiBoolProp: [faker.random.boolean(), faker.random.boolean()],
      dateProp: faker.date.past().toISOString(),
      multiDateProp: [faker.date.past().toISOString(), faker.date.past().toISOString()],
      nestedProp: {
        nestedSubprop: {
          stringSubprop: faker.random.words()
        }
      }
    };
  }

  public static randomNodeProperties(maxDepth: number = 3): INodeProperties {
    const properties: INodeProperties = {};
    for (let i = 0; i <= faker.random.number(10); i++) {
      const propertyName = this.randomMappingPropertyName();
      const propertyType = this.randomMappingPropertyType();
      const multiple = faker.random.boolean();

      // don't go further down if maxDepth <= 0
      if (propertyType === IMappingPropertyType.Nested && maxDepth <= 0) {
        continue;
      }

      switch (propertyType) {
        case IMappingPropertyType.Boolean:
          properties[propertyName] = multiple ? [faker.random.boolean()] : faker.random.boolean();
          break;
        case IMappingPropertyType.Date:
          properties[propertyName] = multiple ? [faker.date.past().toISOString()] : faker.date.past().toISOString();
          break;
        case IMappingPropertyType.Float:
          properties[propertyName] = multiple
            ? [faker.random.number({ precision: 0.01 })]
            : faker.random.number({ precision: 0.01 });
          break;
        case IMappingPropertyType.Integer:
          properties[propertyName] = multiple ? [faker.random.number()] : faker.random.number();
          break;
        case IMappingPropertyType.Nested:
          properties[propertyName] = this.randomNodeProperties(maxDepth - 1);
          break;
        case IMappingPropertyType.Text:
          properties[propertyName] = multiple ? [faker.random.words()] : faker.random.words();
          break;
        default:
          throw new Error(`Type ${propertyType} not yet supported.`);
      }
    }

    return properties;
  }

  public static randomAudit(): IAudit {
    return {
      createdAt: faker.date.past().toISOString(),
      createdBy: faker.random.word(),
      modifiedAt: faker.date.past().toISOString(),
      modifiedBy: faker.random.word()
    };
  }

  public static randomUsername(): string {
    return faker.random.word();
  }

  public static randomUUID(): string {
    return faker.random.uuid();
  }

  public static randomAuthenticationContext(): IAuthenticationContext {
    return {
      userUuid: TestDataGenerator.randomUUID()
    };
  }

  public static randomExecutionContext(): IExecutionContext {
    return {
      auth: this.randomAuthenticationContext(),
      stores: {
        nodes: new NodeInmemoryStore(),
        mappings: new MappingInmemoryStore()
      }
    };
  }
}
