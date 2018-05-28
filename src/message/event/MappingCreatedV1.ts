// external dependencies
import { Event } from "eventum-sdk";

// models
import { MappingProperties } from "../../model/Mapping";

export interface MappingCreatedV1Payload {
  name: string;
  properties: MappingProperties;
}

export class MappingCreatedV1 extends Event<MappingCreatedV1Payload> {
  public static readonly NAME = "MappingCreated";

  constructor(aggregateId: string, sequence: number, payload: MappingCreatedV1Payload) {
    super(MappingCreatedV1.NAME, aggregateId, sequence, payload);
  }
}
