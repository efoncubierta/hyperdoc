import { Event } from "eventum-sdk";
import { NodeProperties } from "hyperdoc-core";

export interface NodePropertiesUpdatedV1Payload {
  properties: NodeProperties;
}

export class NodePropertiesUpdatedV1 extends Event<NodePropertiesUpdatedV1Payload> {
  public static readonly NAME = "NodePropertiesUpdated";

  constructor(aggregateId: string, sequence: number, payload: NodePropertiesUpdatedV1Payload) {
    super(NodePropertiesUpdatedV1.NAME, aggregateId, sequence, payload);
  }
}
