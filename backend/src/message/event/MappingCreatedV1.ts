import { Event } from "hyperdoc-eventstore";
import { MappingProperties } from "hyperdoc-core";

export class MappingCreatedV1 extends Event {
  public static readonly NAME = "MappingCreated";

  // metadata
  public readonly $event: string = MappingCreatedV1.NAME;
  public readonly $version: string = "1";

  // data
  public readonly name: string;
  public readonly properties: MappingProperties;

  constructor(aggregateId: string, name: string, properties: MappingProperties) {
    super(aggregateId);
    this.name = name;
    this.properties = properties;
  }
}
