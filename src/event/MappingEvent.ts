import { EventInput } from "eventum-sdk";
import { MappingProperties } from "../model/Mapping";

/**
 * Mapping event types.
 */
export enum MappingEventType {
  CreatedV1 = "MappingCreatedV1",
  PropertiesUpdatedV1 = "MappingPropertiesUpdatedV1",
  DeletedV1 = "MappingDeletedV1"
}

/**
 * Mapping event.
 */
export interface MappingEvent extends EventInput {
  readonly eventType: MappingEventType;
}

/**
 * Mapping created event (version 1).
 */
export interface MappingCreatedV1 extends MappingEvent {
  readonly eventType: MappingEventType.CreatedV1;
  readonly payload: {
    readonly name: string;
    readonly properties: MappingProperties;
  };
}

/**
 * Mapping properties updated event (version 1).
 */
export interface MappingPropertiesUpdatedV1 extends MappingEvent {
  readonly eventType: MappingEventType.PropertiesUpdatedV1;
  readonly payload: {
    readonly properties: MappingProperties;
  };
}

/**
 * Mapping deleted event (version 1).
 */
export interface MappingDeletedV1 extends MappingEvent {
  readonly eventType: MappingEventType.DeletedV1;
}
