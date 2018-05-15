import * as faker from "faker";

import NodeValidator from "../../src/validation/NodeValidator";
import { Node, NodeProperties, NodeBuilder, NodePropertyType } from "../../src/model/Node";
import { Audit } from "../../src/model/Audit";
import {
  Mapping,
  MappingPropertyType,
  MappingNestedProperty,
  MappingNodeProperty,
  MappingProperties,
  MappingProperty
} from "../../src/model/Mapping";
import { ExecutionContext, AuthenticationContext } from "../../src/model/ExecutionContext";
import NodeInmemoryStore from "../store/inmemory/NodeInmemoryStore";
import MappingInmemoryStore from "../store/inmemory/MappingInmemoryStore";

export default class TestDataGenerator {
  public static fullMapping(): Mapping {
    return {
      uuid: faker.random.uuid(),
      name: faker.random.word(),
      properties: this.fullMappingProperties()
    };
  }

  public static randomMapping(): Mapping {
    return {
      uuid: faker.random.uuid(),
      name: faker.random.word(),
      properties: this.randomMappingProperties()
    };
  }

  public static randomMappingName(): string {
    return faker.random.word().replace(" ", "");
  }

  public static fullMappingProperties(): MappingProperties {
    return {
      stringProp: {
        type: MappingPropertyType.Text,
        mandatory: true,
        multiple: false
      },
      multiStringProp: {
        type: MappingPropertyType.Text,
        mandatory: true,
        multiple: true
      },
      intProp: {
        type: MappingPropertyType.Integer,
        mandatory: true,
        multiple: false
      },
      multiIntProp: {
        type: MappingPropertyType.Integer,
        mandatory: true,
        multiple: true
      },
      floatProp: {
        type: MappingPropertyType.Float,
        mandatory: true,
        multiple: false
      },
      multiFloatProp: {
        type: MappingPropertyType.Float,
        mandatory: true,
        multiple: true
      },
      boolProp: {
        type: MappingPropertyType.Boolean,
        mandatory: true,
        multiple: false
      },
      multiBoolProp: {
        type: MappingPropertyType.Boolean,
        mandatory: true,
        multiple: true
      },
      dateProp: {
        type: MappingPropertyType.Date,
        mandatory: true,
        multiple: false
      },
      multiDateProp: {
        type: MappingPropertyType.Date,
        mandatory: true,
        multiple: true
      },
      nestedProp: {
        type: MappingPropertyType.Nested,
        mandatory: true,
        multiple: false,
        properties: {
          nestedSubprop: {
            type: MappingPropertyType.Nested,
            mandatory: true,
            multiple: false,
            properties: {
              stringSubprop: {
                type: MappingPropertyType.Text,
                mandatory: true,
                multiple: false
              }
            }
          }
        }
      } as MappingNestedProperty
    };
  }

  public static randomMappingPropertyType(): MappingPropertyType {
    return faker.random.arrayElement([
      MappingPropertyType.Boolean,
      MappingPropertyType.Date,
      MappingPropertyType.Float,
      MappingPropertyType.Integer,
      MappingPropertyType.Nested,
      MappingPropertyType.Text
    ]);
  }

  public static randomMappingPropertyName(): string {
    return faker.random.word().replace(" ", "");
  }

  public static randomMappingProperties(maxDepth: number = 3): MappingProperties {
    const properties: MappingProperties = {};
    for (let i = 0; i < faker.random.number(10); i++) {
      const propertyName = this.randomMappingPropertyName();
      const propertyType = this.randomMappingPropertyType();
      const mandatory = faker.random.boolean();
      const multiple = faker.random.boolean();

      // don't go further down if maxDepth <= 0
      if (propertyType === MappingPropertyType.Nested && maxDepth <= 0) {
        continue;
      }

      switch (propertyType) {
        case MappingPropertyType.Nested:
          properties[propertyName] = {
            type: propertyType,
            mandatory,
            multiple,
            properties: this.randomMappingProperties(maxDepth - 1)
          } as MappingNestedProperty;
          return;
        default:
          properties[propertyName] = {
            type: propertyType,
            mandatory,
            multiple
          } as MappingProperty;
      }
    }

    return properties;
  }

  public static randomFullNode(): Node {
    return new NodeBuilder()
      .uuid(this.randomUUID())
      .mapping(this.randomMappingName())
      .properties(this.randomFullNodeProperties())
      .audit(this.randomAudit())
      .build();
  }

  public static randomNode(): Node {
    return new NodeBuilder()
      .uuid(this.randomUUID())
      .mapping(this.randomMappingName())
      .properties(this.randomNodeProperties())
      .audit(this.randomAudit())
      .build();
  }

  public static randomFullNodeProperties(): NodeProperties {
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

  public static randomNodeProperties(maxDepth: number = 3): NodeProperties {
    const properties: NodeProperties = {};
    for (let i = 0; i <= faker.random.number(10); i++) {
      const propertyName = this.randomMappingPropertyName();
      const propertyType = this.randomMappingPropertyType();
      const multiple = faker.random.boolean();

      // don't go further down if maxDepth <= 0
      if (propertyType === MappingPropertyType.Nested && maxDepth <= 0) {
        continue;
      }

      switch (propertyType) {
        case MappingPropertyType.Boolean:
          properties[propertyName] = multiple ? [faker.random.boolean()] : faker.random.boolean();
          break;
        case MappingPropertyType.Date:
          properties[propertyName] = multiple ? [faker.date.past().toISOString()] : faker.date.past().toISOString();
          break;
        case MappingPropertyType.Float:
          properties[propertyName] = multiple
            ? [faker.random.number({ precision: 0.01 })]
            : faker.random.number({ precision: 0.01 });
          break;
        case MappingPropertyType.Integer:
          properties[propertyName] = multiple ? [faker.random.number()] : faker.random.number();
          break;
        case MappingPropertyType.Nested:
          properties[propertyName] = this.randomNodeProperties(maxDepth - 1);
          break;
        case MappingPropertyType.Text:
          properties[propertyName] = multiple ? [faker.random.words()] : faker.random.words();
          break;
        default:
          throw new Error(`Type ${propertyType} not yet supported.`);
      }
    }

    return properties;
  }

  public static randomAudit(): Audit {
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

  public static randomAuthenticationContext(): AuthenticationContext {
    return {
      userUuid: TestDataGenerator.randomUUID()
    };
  }

  public static randomExecutionContext(): ExecutionContext {
    return {
      auth: this.randomAuthenticationContext(),
      stores: {
        nodes: new NodeInmemoryStore(),
        mappings: new MappingInmemoryStore()
      }
    };
  }
}
