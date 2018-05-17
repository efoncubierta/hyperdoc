import { Event } from "hyperdoc-eventstore";
import { NodeProperties } from "hyperdoc-core";

export class NodeCreatedV1 extends Event {
  public static readonly NAME = "NodeCreated";

  // metadata
  public readonly $event: string = NodeCreatedV1.NAME;
  public readonly $version: string = "1";

  // data
  public readonly mappingName: string;
  public readonly properties: NodeProperties;

  constructor(aggregateId: string, mappingName: string, properties: NodeProperties) {
    super(aggregateId);
    this.mappingName = mappingName;
    this.properties = properties;
  }
}
