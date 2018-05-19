import { Event } from "hyperdoc-eventstore";
import { MappingProperties } from "hyperdoc-core";

export class MappingCreatedV1 extends Event {
  public static readonly NAME = "MappingCreated";

  // data
  public readonly name: string;
  public readonly properties: MappingProperties;

  constructor(aggregateId: string, sequence: number, name: string, properties: MappingProperties) {
    super(MappingCreatedV1.NAME, aggregateId, sequence);
    this.name = name;
    this.properties = properties;
  }
}
