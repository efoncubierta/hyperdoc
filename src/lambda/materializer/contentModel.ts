// AWS dependencies
import { DynamoDB } from "aws-sdk";
import { APIGatewayEvent, Callback, Context, Handler, DynamoDBStreamEvent } from "aws-lambda";

// Eventum dependencies
import { Event } from "eventum-sdk";
import { MappingCreatedV1 } from "../../message/event/MappingCreatedV1";
import { MappingPropertiesUpdatedV1 } from "../../message/event/MappingPropertiesUpdatedV1";
import { MappingDeletedV1 } from "../../message/event/MappingDeletedV1";
import { NodeCreatedV1 } from "../../message/event/NodeCreatedV1";
import { NodePropertiesUpdatedV1 } from "../../message/event/NodePropertiesUpdatedV1";
import { NodeDeletedV1 } from "../../message/event/NodeDeletedV1";

// stores
import { StoreFactory } from "../../store/StoreFactory";
import { MappingBuilder, NodeBuilder } from "../../model";
const mappingStore = StoreFactory.getMappingStore();
const nodeStore = StoreFactory.getNodeStore();

export const handler: Handler = (event: DynamoDBStreamEvent, context: Context, callback: Callback) => {
  const promises = Promise.resolve();
  event.Records.map((record) => {
    const e = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage) as Event<any>;

    promises.then(() => {
      return handleEvent(e);
    });
  });

  promises
    .then(() => {
      callback(null);
    })
    .catch((error) => {
      callback(error, null);
    });
};

function handleEvent(event: Event<any>): Promise<void> {
  switch (event.eventType) {
    case MappingCreatedV1.NAME:
      return handleMappingCreatedV1(event as MappingCreatedV1);
    case MappingPropertiesUpdatedV1.NAME:
      return handleMappingPropertiesUpdatedV1(event as MappingPropertiesUpdatedV1);
    case MappingDeletedV1.NAME:
      return handleMappingDeletedV1(event as MappingDeletedV1);
    case NodeCreatedV1.NAME:
      return handleNodeCreatedV1(event as NodeCreatedV1);
    case NodePropertiesUpdatedV1.NAME:
      return handleNodePropertiesUpdatedV1(event as NodePropertiesUpdatedV1);
    case NodeDeletedV1.NAME:
      return handleNodeDeletedV1(event as NodeDeletedV1);
    default:
    // todo do nothing
  }
}

function handleMappingCreatedV1(event: MappingCreatedV1): Promise<void> {
  const mapping = new MappingBuilder()
    .uuid(event.aggregateId)
    .name(event.payload.name)
    .properties(event.payload.properties)
    .build();
  return mappingStore.put(mapping);
}

function handleMappingPropertiesUpdatedV1(event: MappingPropertiesUpdatedV1): Promise<void> {
  return mappingStore.get(event.aggregateId).then((mapping) => {
    if (!mapping) {
      console.error(`Mapping(${event.aggregateId}) doesn't exist. MappingPropertiesUpdated event is ignored.`);
      console.error(event);
      return;
    }

    const newMapping = new MappingBuilder(mapping).properties(event.payload.properties).build();

    return mappingStore.put(newMapping);
  });
}

function handleMappingDeletedV1(event: MappingDeletedV1): Promise<void> {
  return mappingStore.delete(event.aggregateId);
}

function handleNodeCreatedV1(event: NodeCreatedV1): Promise<void> {
  const node = new NodeBuilder()
    .uuid(event.aggregateId)
    .mapping(event.payload.mappingName)
    .properties(event.payload.properties)
    .build();
  return nodeStore.put(node);
}

function handleNodePropertiesUpdatedV1(event: NodePropertiesUpdatedV1): Promise<void> {
  return nodeStore.get(event.aggregateId).then((node) => {
    if (!node) {
      console.error(`Node(${event.aggregateId}) doesn't exist. NodePropertiesUpdated event is ignored.`);
      console.error(event);
      return;
    }

    const newNode = new NodeBuilder(node).properties(event.payload.properties).build();

    return nodeStore.put(newNode);
  });
}

function handleNodeDeletedV1(event: NodeDeletedV1): Promise<void> {
  return nodeStore.delete(event.aggregateId);
}
