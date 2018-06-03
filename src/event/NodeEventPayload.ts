import { NodeProperties } from "../model/Node";

export interface NodeCreatedV1Payload {
  mappingName: string;
  properties: NodeProperties;
}

export interface NodePropertiesUpdatedV1Payload {
  properties: NodeProperties;
}
