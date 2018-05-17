import { Event } from "hyperdoc-eventstore";
import { NodeProperties } from "hyperdoc-core";

export class NodePropertiesUpdatedV1 extends Event {
  public static readonly NAME = "NodePropertiesUpdated";

  // metadata
  public readonly $event: string = NodePropertiesUpdatedV1.NAME;
  public readonly $version: string = "1";

  // data
  public readonly properties: NodeProperties;

  constructor(aggregateId: string, properties: NodeProperties) {
    super(aggregateId);
    this.properties = properties;
  }
}
