import { Event } from "eventum-sdk";
import { NodeProperties } from "hyperdoc-core";

export interface NodeCreatedV1Payload {
  mappingName: string;
  properties: NodeProperties;
}

export class NodeCreatedV1 extends Event<NodeCreatedV1Payload> {
  public static readonly NAME = "NodeCreated";

  constructor(aggregateId: string, sequence: number, payload: NodeCreatedV1Payload) {
    super(NodeCreatedV1.NAME, aggregateId, sequence, payload);
  }
}
