import { MappingProperties } from "../model/Mapping";

export interface MappingCreatedV1Payload {
  name: string;
  properties: MappingProperties;
}

export interface MappingPropertiesUpdatedV1Payload {
  properties: MappingProperties;
}