// eventum dependencies
import { Event, Materializer } from "eventum-sdk";

// model
import { MappingBuilder } from "../model/Mapping";
import { NodeBuilder } from "../model/Node";

// messages
import { MappingCreatedV1 } from "../message/event/MappingCreatedV1";
import { MappingPropertiesUpdatedV1 } from "../message/event/MappingPropertiesUpdatedV1";
import { MappingDeletedV1 } from "../message/event/MappingDeletedV1";
import { NodeCreatedV1 } from "../message/event/NodeCreatedV1";
import { NodePropertiesUpdatedV1 } from "../message/event/NodePropertiesUpdatedV1";
import { NodeDeletedV1 } from "../message/event/NodeDeletedV1";

// stores
import { StoreFactory } from "../store/StoreFactory";

export class ContentModelMaterializer extends Materializer {
  public handle(event: Event<any>): Promise<void> {
    switch (event.eventType) {
      case MappingCreatedV1.NAME:
        return this.handleMappingCreatedV1(event as MappingCreatedV1);
      case MappingPropertiesUpdatedV1.NAME:
        return this.handleMappingPropertiesUpdatedV1(event as MappingPropertiesUpdatedV1);
      case MappingDeletedV1.NAME:
        return this.handleMappingDeletedV1(event as MappingDeletedV1);
      case NodeCreatedV1.NAME:
        return this.handleNodeCreatedV1(event as NodeCreatedV1);
      case NodePropertiesUpdatedV1.NAME:
        return this.handleNodePropertiesUpdatedV1(event as NodePropertiesUpdatedV1);
      case NodeDeletedV1.NAME:
        return this.handleNodeDeletedV1(event as NodeDeletedV1);
      default:
      // todo do nothing
    }
  }

  private handleMappingCreatedV1(event: MappingCreatedV1): Promise<void> {
    const mapping = new MappingBuilder()
      .uuid(event.aggregateId)
      .name(event.payload.name)
      .properties(event.payload.properties)
      .build();
    return StoreFactory.getMappingStore().put(mapping);
  }

  private handleMappingPropertiesUpdatedV1(event: MappingPropertiesUpdatedV1): Promise<void> {
    return StoreFactory.getMappingStore()
      .get(event.aggregateId)
      .then((mapping) => {
        if (!mapping) {
          console.error(`Mapping(${event.aggregateId}) doesn't exist. MappingPropertiesUpdated event is ignored.`);
          console.error(event);
          return;
        }

        const newMapping = new MappingBuilder(mapping).properties(event.payload.properties).build();

        return StoreFactory.getMappingStore().put(newMapping);
      });
  }

  private handleMappingDeletedV1(event: MappingDeletedV1): Promise<void> {
    return StoreFactory.getMappingStore().delete(event.aggregateId);
  }

  private handleNodeCreatedV1(event: NodeCreatedV1): Promise<void> {
    const node = new NodeBuilder()
      .uuid(event.aggregateId)
      .mapping(event.payload.mappingName)
      .properties(event.payload.properties)
      .build();
    return StoreFactory.getNodeStore().put(node);
  }

  private handleNodePropertiesUpdatedV1(event: NodePropertiesUpdatedV1): Promise<void> {
    return StoreFactory.getNodeStore()
      .get(event.aggregateId)
      .then((node) => {
        if (!node) {
          console.error(`Node(${event.aggregateId}) doesn't exist. NodePropertiesUpdated event is ignored.`);
          console.error(event);
          return;
        }

        const newNode = new NodeBuilder(node).properties(event.payload.properties).build();

        return StoreFactory.getNodeStore().put(newNode);
      });
  }

  private handleNodeDeletedV1(event: NodeDeletedV1): Promise<void> {
    return StoreFactory.getNodeStore().delete(event.aggregateId);
  }
}
