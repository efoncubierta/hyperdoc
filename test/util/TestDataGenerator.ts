// external dependencies
import * as faker from "faker";

// Hyperdoc
import { AuthenticationContext, ExecutionContext } from "../../src/ExecutionContext";

// Hyperdoc models models
import {
  Mapping,
  MappingProperties,
  MappingPropertyType,
  MappingNestedProperty,
  MappingProperty,
  MappingId
} from "../../src/model/Mapping";
import { Node, NodeProperties, NodeId } from "../../src/model/Node";
import { Audit } from "../../src/model/Audit";

// Hyperdoc events
import {
  MappingCreatedV1,
  MappingEventType,
  MappingPropertiesUpdatedV1,
  MappingDeletedV1,
  MappingCreatedV1Payload,
  MappingPropertiesUpdatedV1Payload
} from "../../src/event/MappingEvent";
import {
  NodeCreatedV1,
  NodeEventType,
  NodePropertiesUpdatedV1,
  NodeEnabledV1,
  NodeDisabledV1,
  NodeLockedV1,
  NodeUnlockedV1,
  NodeDeletedV1,
  NodeCreatedV1Payload,
  NodePropertiesUpdatedV1Payload,
  NodeDisabledV1Payload
} from "../../src/event/NodeEvent";

export class TestDataGenerator {
  public static randomMappingId(): MappingId {
    return this.randomUUID();
  }

  public static fullMapping(): Mapping {
    return {
      mappingId: this.randomMappingId(),
      name: this.randomMappingName(),
      properties: this.fullMappingProperties()
    };
  }

  public static randomMapping(): Mapping {
    return {
      mappingId: this.randomMappingId(),
      name: this.randomMappingName(),
      properties: this.randomMappingProperties()
    };
  }

  public static randomMappingName(): string {
    return faker.random
      .words(3)
      .replace(/[0-9-\s,._]/g, "")
      .slice(0, 10)
      .toLowerCase();
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

    for (let i = 0; i < 10; i++) {
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
          break;
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

  public static randomNodeId(): NodeId {
    return this.randomUUID();
  }

  public static randomFullNode(): Node {
    return {
      nodeId: this.randomNodeId(),
      mappingName: this.randomMappingName(),
      properties: this.randomFullNodeProperties()
    };
  }

  public static randomNode(): Node {
    return {
      nodeId: this.randomNodeId(),
      mappingName: this.randomMappingName(),
      properties: this.randomNodeProperties()
    };
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
    for (let i = 0; i <= faker.random.number({ min: 2, max: 10 }); i++) {
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
      auth: this.randomAuthenticationContext()
    };
  }

  public static randomMappingCreatedV1(mappingId?: MappingId, sequence?: number): MappingCreatedV1 {
    return {
      eventId: this.randomUUID(),
      eventType: MappingEventType.CreatedV1,
      occurredAt: faker.date.past().toISOString(),
      aggregateId: mappingId ? mappingId : this.randomMappingId(),
      sequence: sequence >= 0 ? sequence : faker.random.number(1000),
      payload: this.randomMappingCreatedV1Payload()
    };
  }

  public static randomMappingCreatedV1Payload(): MappingCreatedV1Payload {
    return {
      name: this.randomMappingName(),
      properties: this.randomMappingProperties()
    };
  }

  public static randomMappingPropertiesUpdatedV1(mappingId?: MappingId, sequence?: number): MappingPropertiesUpdatedV1 {
    return {
      eventId: this.randomUUID(),
      eventType: MappingEventType.PropertiesUpdatedV1,
      occurredAt: faker.date.past().toISOString(),
      aggregateId: mappingId ? mappingId : this.randomMappingId(),
      sequence: sequence >= 0 ? sequence : faker.random.number(1000),
      payload: this.randomMappingPropertiesUpdatedV1Payload()
    };
  }

  public static randomMappingPropertiesUpdatedV1Payload(): MappingPropertiesUpdatedV1Payload {
    return {
      properties: this.randomMappingProperties()
    };
  }

  public static randomMappingDeletedV1(mappingId?: MappingId, sequence?: number): MappingDeletedV1 {
    return {
      eventId: this.randomUUID(),
      eventType: MappingEventType.DeletedV1,
      occurredAt: faker.date.past().toISOString(),
      aggregateId: mappingId ? mappingId : this.randomMappingId(),
      sequence: sequence >= 0 ? sequence : faker.random.number(1000)
    };
  }

  public static randomNodeCreatedV1(nodeId?: NodeId, sequence?: number): NodeCreatedV1 {
    return {
      eventId: this.randomUUID(),
      eventType: NodeEventType.CreatedV1,
      occurredAt: faker.date.past().toISOString(),
      aggregateId: nodeId ? nodeId : this.randomNodeId(),
      sequence: sequence >= 0 ? sequence : faker.random.number(1000),
      payload: this.randomNodeCreatedV1Payload()
    };
  }

  public static randomNodeCreatedV1Payload(): NodeCreatedV1Payload {
    return {
      mappingName: this.randomMappingName(),
      properties: this.randomNodeProperties()
    };
  }

  public static randomNodePropertiesUpdatedV1(nodeId?: NodeId, sequence?: number): NodePropertiesUpdatedV1 {
    return {
      eventId: this.randomUUID(),
      eventType: NodeEventType.PropertiesUpdatedV1,
      occurredAt: faker.date.past().toISOString(),
      aggregateId: nodeId ? nodeId : this.randomNodeId(),
      sequence: sequence >= 0 ? sequence : faker.random.number(1000),
      payload: this.randomNodePropertiesUpdatedV1Payload()
    };
  }

  public static randomNodePropertiesUpdatedV1Payload(): NodePropertiesUpdatedV1Payload {
    return {
      properties: this.randomNodeProperties()
    };
  }

  public static randomNodeEnabledV1(nodeId?: NodeId, sequence?: number): NodeEnabledV1 {
    return {
      eventId: this.randomUUID(),
      eventType: NodeEventType.EnabledV1,
      occurredAt: faker.date.past().toISOString(),
      aggregateId: nodeId ? nodeId : this.randomNodeId(),
      sequence: sequence >= 0 ? sequence : faker.random.number(1000)
    };
  }

  public static randomNodeDisabledV1(nodeId?: NodeId, sequence?: number): NodeDisabledV1 {
    return {
      eventId: this.randomUUID(),
      eventType: NodeEventType.DisabledV1,
      occurredAt: faker.date.past().toISOString(),
      aggregateId: nodeId ? nodeId : this.randomNodeId(),
      sequence: sequence >= 0 ? sequence : faker.random.number(1000),
      payload: this.randomNodeDisabledV1Payload()
    };
  }

  public static randomNodeDisabledV1Payload(): NodeDisabledV1Payload {
    return {
      reason: faker.random.words()
    };
  }

  public static randomNodeLockedV1(nodeId?: NodeId, sequence?: number): NodeLockedV1 {
    return {
      eventId: this.randomUUID(),
      eventType: NodeEventType.LockedV1,
      occurredAt: faker.date.past().toISOString(),
      aggregateId: nodeId ? nodeId : this.randomNodeId(),
      sequence: sequence >= 0 ? sequence : faker.random.number(1000)
    };
  }

  public static randomNodeUnlockedV1(nodeId?: NodeId, sequence?: number): NodeUnlockedV1 {
    return {
      eventId: this.randomUUID(),
      eventType: NodeEventType.UnlockedV1,
      occurredAt: faker.date.past().toISOString(),
      aggregateId: nodeId ? nodeId : this.randomNodeId(),
      sequence: sequence >= 0 ? sequence : faker.random.number(1000)
    };
  }

  public static randomNodeDeletedV1(nodeId?: NodeId, sequence?: number): NodeDeletedV1 {
    return {
      eventId: this.randomUUID(),
      eventType: NodeEventType.DeletedV1,
      occurredAt: faker.date.past().toISOString(),
      aggregateId: nodeId ? nodeId : this.randomNodeId(),
      sequence: sequence >= 0 ? sequence : faker.random.number(1000)
    };
  }

  // public static randomAuthenticationContext(): AuthenticationContext {
  //   return {
  //     userUuid: TestDataGenerator.randomUUID()
  //   };
  // }

  // public static randomExecutionContext(): ExecutionContext {
  //   return {
  //     auth: this.randomAuthenticationContext(),
  //     stores: {
  //       nodes: new NodeInmemoryStore(),
  //       mappings: new MappingInmemoryStore()
  //     }
  //   };
  // }
}
