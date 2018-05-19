import { Event } from "hyperdoc-eventstore";
import { NodeProperties } from "hyperdoc-core";

export class NodeCreatedV1 extends Event {
  public static readonly NAME = "NodeCreated";

  // data
  public readonly mappingName: string;
  public readonly properties: NodeProperties;

  constructor(aggregateId: string, sequence: number, mappingName: string, properties: NodeProperties) {
    super(NodeCreatedV1.NAME, aggregateId, sequence);
    this.mappingName = mappingName;
    this.properties = properties;
  }
}
