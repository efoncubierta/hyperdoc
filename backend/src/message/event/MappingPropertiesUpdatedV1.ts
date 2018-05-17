import { Event } from "hyperdoc-eventstore";
import { MappingProperties } from "hyperdoc-core";

export class MappingPropertiesUpdatedV1 extends Event {
  public static readonly NAME = "MappingPropertiesUpdated";

  // metadata
  public readonly $event: string = MappingPropertiesUpdatedV1.NAME;
  public readonly $version: string = "1";

  // data
  public readonly properties: MappingProperties;

  constructor(aggregateId: string, properties: MappingProperties) {
    super(aggregateId);
    this.properties = properties;
  }
}
