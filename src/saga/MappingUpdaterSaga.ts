// Eventum dependencies
import { Event } from "eventum-sdk";

// Hyperdoc stores
import { StoreFactory } from "../store/StoreFactory";

// Hyperdoc events
import { NodeEventType, NodeCreatedV1, NodePropertiesUpdatedV1 } from "../event/NodeEvent";

// Hyperdoc models
import { NodeProperties } from "../model/Node";
import { Mapping, MappingStrictnessLevel } from "../model/Mapping";

// Hyperdoc validators
import { NodePropertiesMappingGenerator } from "../validation/NodePropertiesMappingGenerator";

// Hyperdoc writers
import { MappingWriter } from "../writer/MappingWriter";

export class MappingUpdaterSaga {
  public handle(event: Event): Promise<void> {
    switch (event.eventType) {
      case NodeEventType.CreatedV1:
        return this.handleNodeCreatedV1(event as NodeCreatedV1);
      case NodeEventType.PropertiesUpdatedV1:
        return this.handleNodePropertiesUpdatedV1(event as NodePropertiesUpdatedV1);
      default:
        return Promise.resolve();
      // todo do nothing
    }
  }

  private handleNodeCreatedV1(event: NodeCreatedV1): Promise<void> {
    const mappingName = event.payload.mappingName;
    const nodeProperties = event.payload.properties;

    return StoreFactory.getMappingStore()
      .getByName(event.payload.mappingName)
      .then((mappingOpt) => {
        return mappingOpt.foldL(
          () => this.createMapping(mappingName, nodeProperties),
          (mapping) => this.updateMapping(mapping, nodeProperties)
        );
      })
      .then(() => {
        return;
      });
  }

  private handleNodePropertiesUpdatedV1(event: NodePropertiesUpdatedV1): Promise<void> {
    const nodeProperties = event.payload.properties;

    return StoreFactory.getNodeStore()
      .get(event.aggregateId)
      .then((nodeOpt) => {
        return nodeOpt.foldL(
          () => {
            // TODO throw error
            throw new Error("Node does not exist");
          },
          (node) => StoreFactory.getMappingStore().getByName(node.mappingName)
        );
      })
      .then((mappingOpt) => {
        return mappingOpt.foldL(
          () => {
            throw new Error("Mapping does not exist");
          },
          (mapping) => this.updateMapping(mapping, nodeProperties)
        );
      })
      .then(() => {
        return;
      });
  }

  private createMapping(mappingName: string, nodeProperties: NodeProperties): Promise<Mapping> {
    const mappingProperties = NodePropertiesMappingGenerator.toMappingProperties(nodeProperties);
    return MappingWriter.create(null, mappingName, MappingStrictnessLevel.Organic, mappingProperties);
  }

  private updateMapping(mapping: Mapping, nodeProperties: NodeProperties): Promise<Mapping> {
    const newProperties = NodePropertiesMappingGenerator.toMappingProperties(nodeProperties);
    const mappingProperties = {
      ...mapping.properties,
      ...newProperties
    };
    return MappingWriter.setProperties(null, mapping.mappingId, mappingProperties);
  }
}
