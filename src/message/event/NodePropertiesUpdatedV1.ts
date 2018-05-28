// external dependencies
import { Event } from "eventum-sdk";

// models
import { NodeProperties } from "../../model/Node";

export interface NodePropertiesUpdatedV1Payload {
  properties: NodeProperties;
}

export class NodePropertiesUpdatedV1 extends Event<NodePropertiesUpdatedV1Payload> {
  public static readonly NAME = "NodePropertiesUpdated";

  constructor(aggregateId: string, sequence: number, payload: NodePropertiesUpdatedV1Payload) {
    super(NodePropertiesUpdatedV1.NAME, aggregateId, sequence, payload);
  }
}
