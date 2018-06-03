// eventum dependencies
import { Event, Materializer } from "eventum-sdk";

// model
import { MappingBuilder } from "../model/Mapping";
import { NodeBuilder } from "../model/Node";

// stores
import { StoreFactory } from "../store/StoreFactory";

// events
import { MappingEventType } from "../event/MappingEventType";
import { NodeEventType } from "../event/NodeEventType";
import { MappingCreatedV1Payload, MappingPropertiesUpdatedV1Payload } from "../event/MappingEventPayload";
import { NodeCreatedV1Payload, NodePropertiesUpdatedV1Payload } from "../event/NodeEventPayload";

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
      // todo do nothing
    }
  }

  private handleMappingCreatedV1(event: Event): Promise<void> {
    const payload = event.payload as MappingCreatedV1Payload;
    const mapping = new MappingBuilder()
      .uuid(event.aggregateId)
      .name(payload.name)
      .properties(payload.properties)
      .build();
    return StoreFactory.getMappingStore().put(mapping);
  }

  private handleMappingPropertiesUpdatedV1(event: Event): Promise<void> {
    const payload = event.payload as MappingPropertiesUpdatedV1Payload;
    return StoreFactory.getMappingStore()
      .get(event.aggregateId)
      .then((mapping) => {
        if (!mapping) {
          console.error(`Mapping(${event.aggregateId}) doesn't exist. MappingPropertiesUpdated event is ignored.`);
          console.error(event);
          return;
        }

        const newMapping = new MappingBuilder(mapping).properties(payload.properties).build();

        return StoreFactory.getMappingStore().put(newMapping);
      });
  }

  private handleMappingDeletedV1(event: Event): Promise<void> {
    return StoreFactory.getMappingStore().delete(event.aggregateId);
  }

  private handleNodeCreatedV1(event: Event): Promise<void> {
    const payload = event.payload as NodeCreatedV1Payload;
    const node = new NodeBuilder()
      .uuid(event.aggregateId)
      .mapping(payload.mappingName)
      .properties(payload.properties)
      .build();
    return StoreFactory.getNodeStore().put(node);
  }

  private handleNodePropertiesUpdatedV1(event: Event): Promise<void> {
    const payload = event.payload as NodePropertiesUpdatedV1Payload;
    return StoreFactory.getNodeStore()
      .get(event.aggregateId)
      .then((node) => {
        if (!node) {
          console.error(`Node(${event.aggregateId}) doesn't exist. NodePropertiesUpdated event is ignored.`);
          console.error(event);
          return;
        }

        const newNode = new NodeBuilder(node).properties(payload.properties).build();

        return StoreFactory.getNodeStore().put(newNode);
      });
  }

  private handleNodeDeletedV1(event: Event): Promise<void> {
    return StoreFactory.getNodeStore().delete(event.aggregateId);
  }
}
