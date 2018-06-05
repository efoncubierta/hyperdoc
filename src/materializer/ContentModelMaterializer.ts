// Eventum dependencies
import { Event, Materializer } from "eventum-sdk";

// Hyperdoc stores
import { StoreFactory } from "../store/StoreFactory";

// Hyperdoc events
import { MappingEventType } from "../event/MappingEventType";
import { NodeEventType } from "../event/NodeEventType";
import { MappingCreatedV1Payload, MappingPropertiesUpdatedV1Payload } from "../event/MappingEventPayload";
import { NodeCreatedV1Payload, NodePropertiesUpdatedV1Payload } from "../event/NodeEventPayload";

// Hyperdoc models
import { Mapping } from "../model/Mapping";
import { Node } from "../model/Node";

export class ContentModelMaterializer extends Materializer {
  public handle(event: Event): Promise<void> {
    switch (event.eventType) {
      case MappingEventType.CreatedV1:
        return this.handleMappingCreatedV1(event);
      case MappingEventType.PropertiesUpdatedV1:
        return this.handleMappingPropertiesUpdatedV1(event);
      case MappingEventType.DeletedV1:
        return this.handleMappingDeletedV1(event);
      case NodeEventType.CreatedV1:
        return this.handleNodeCreatedV1(event);
      case NodeEventType.PropertiesUpdatedV1:
        return this.handleNodePropertiesUpdatedV1(event);
      case NodeEventType.DeletedV1:
        return this.handleNodeDeletedV1(event);
      default:
        return Promise.resolve();
      // todo do nothing
    }
  }

  private handleMappingCreatedV1(event: Event): Promise<void> {
    const payload = event.payload as MappingCreatedV1Payload;
    const mapping: Mapping = {
      id: event.aggregateId,
      name: payload.name,
      properties: payload.properties
    };
    return StoreFactory.getMappingStore().put(mapping);
  }

  private handleMappingPropertiesUpdatedV1(event: Event): Promise<void> {
    const payload = event.payload as MappingPropertiesUpdatedV1Payload;
    return StoreFactory.getMappingStore()
      .get(event.aggregateId)
      .then((mappingOpt) => {
        return mappingOpt.foldL(
          () => {
            console.error(`Mapping(${event.aggregateId}) doesn't exist. MappingPropertiesUpdated event is ignored.`);
            console.error(event);
            return;
          },
          (mapping) => {
            const newMapping: Mapping = {
              ...mapping,
              properties: payload.properties
            };

            return StoreFactory.getMappingStore().put(newMapping);
          }
        );
      });
  }

  private handleMappingDeletedV1(event: Event): Promise<void> {
    return StoreFactory.getMappingStore().delete(event.aggregateId);
  }

  private handleNodeCreatedV1(event: Event): Promise<void> {
    const payload = event.payload as NodeCreatedV1Payload;
    const node: Node = {
      id: event.aggregateId,
      mappingName: payload.mappingName,
      properties: payload.properties
    };
    return StoreFactory.getNodeStore().put(node);
  }

  private handleNodePropertiesUpdatedV1(event: Event): Promise<void> {
    const payload = event.payload as NodePropertiesUpdatedV1Payload;
    return StoreFactory.getNodeStore()
      .get(event.aggregateId)
      .then((nodeOpt) => {
        return nodeOpt.foldL(
          () => {
            console.error(`Node(${event.aggregateId}) doesn't exist. NodePropertiesUpdated event is ignored.`);
            console.error(event);
            return;
          },
          (node) => {
            const newNode: Node = {
              ...node,
              properties: payload.properties
            };

            return StoreFactory.getNodeStore().put(newNode);
          }
        );
      });
  }

  private handleNodeDeletedV1(event: Event): Promise<void> {
    return StoreFactory.getNodeStore().delete(event.aggregateId);
  }
}
