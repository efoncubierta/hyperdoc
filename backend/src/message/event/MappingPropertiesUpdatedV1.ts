import { Event } from "eventum-sdk";
import { MappingProperties } from "hyperdoc-core";

export interface MappingPropertiesUpdatedV1Payload {
  properties: MappingProperties;
}

export class MappingPropertiesUpdatedV1 extends Event<MappingPropertiesUpdatedV1Payload> {
  public static readonly NAME = "MappingPropertiesUpdated";

  constructor(aggregateId: string, sequence: number, payload: MappingPropertiesUpdatedV1Payload) {
    super(MappingPropertiesUpdatedV1.NAME, aggregateId, sequence, payload);
  }
}
