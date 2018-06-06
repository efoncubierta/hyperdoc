// Eventum dependencies
import { Event, Materializer } from "eventum-sdk";

// Hyperdoc stores
import { StoreFactory } from "../store/StoreFactory";

// Hyperdoc events
import {
  MappingEventType,
  MappingCreatedV1,
  MappingPropertiesUpdatedV1,
  MappingDeletedV1
} from "../event/MappingEvent";
import { NodeEventType, NodeCreatedV1, NodePropertiesUpdatedV1, NodeDeletedV1 } from "../event/NodeEvent";

// Hyperdoc models
import { Mapping } from "../model/Mapping";
import { Node } from "../model/Node";

export class ContentModelMaterializer extends Materializer {
  public handle(event: Event): Promise<void> {
    switch (event.eventType) {
      case MappingEventType.CreatedV1:
        return this.handleMappingCreatedV1(event as MappingCreatedV1);
      case MappingEventType.PropertiesUpdatedV1:
        return this.handleMappingPropertiesUpdatedV1(event as MappingPropertiesUpdatedV1);
      case MappingEventType.DeletedV1:
        return this.handleMappingDeletedV1(event as MappingDeletedV1);
      case NodeEventType.CreatedV1:
        return this.handleNodeCreatedV1(event as NodeCreatedV1);
      case NodeEventType.PropertiesUpdatedV1:
        return this.handleNodePropertiesUpdatedV1(event as NodePropertiesUpdatedV1);
      case NodeEventType.DeletedV1:
        return this.handleNodeDeletedV1(event as NodeDeletedV1);
      default:
        return Promise.resolve();
      // todo do nothing
    }
  }

  private handleMappingCreatedV1(event: MappingCreatedV1): Promise<void> {
    const mapping: Mapping = {
      mappingId: event.aggregateId,
      ...event.payload
    };
    return StoreFactory.getMappingStore().put(mapping);
  }

  private handleMappingPropertiesUpdatedV1(event: MappingPropertiesUpdatedV1): Promise<void> {
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
              ...event.payload
            };

            return StoreFactory.getMappingStore().put(newMapping);
          }
        );
      });
  }

  private handleMappingDeletedV1(event: MappingDeletedV1): Promise<void> {
    return StoreFactory.getMappingStore().delete(event.aggregateId);
  }

  private handleNodeCreatedV1(event: NodeCreatedV1): Promise<void> {
    const node: Node = {
      nodeId: event.aggregateId,
      ...event.payload
    };
    return StoreFactory.getNodeStore().put(node);
  }

  private handleNodePropertiesUpdatedV1(event: NodePropertiesUpdatedV1): Promise<void> {
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
              ...event.payload
            };

            return StoreFactory.getNodeStore().put(newNode);
          }
        );
      });
  }

  private handleNodeDeletedV1(event: NodeDeletedV1): Promise<void> {
    return StoreFactory.getNodeStore().delete(event.aggregateId);
  }
}
