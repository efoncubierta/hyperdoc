import { Event } from "hyperdoc-eventstore";
import { MappingProperties } from "hyperdoc-core";

export class MappingPropertiesUpdatedV1 extends Event {
  public static readonly NAME = "MappingPropertiesUpdated";

  // data
  public readonly properties: MappingProperties;

  constructor(aggregateId: string, sequence: number, properties: MappingProperties) {
    super(MappingPropertiesUpdatedV1.NAME, aggregateId, sequence);
    this.properties = properties;
  }
}
