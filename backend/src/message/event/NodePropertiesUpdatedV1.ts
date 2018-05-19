import { Event } from "hyperdoc-eventstore";
import { NodeProperties } from "hyperdoc-core";

export class NodePropertiesUpdatedV1 extends Event {
  public static readonly NAME = "NodePropertiesUpdated";

  // data
  public readonly properties: NodeProperties;

  constructor(aggregateId: string, sequence: number, properties: NodeProperties) {
    super(NodePropertiesUpdatedV1.NAME, aggregateId, sequence);
    this.properties = properties;
  }
}
