import { Event } from "eventum-sdk";
import { MappingProperties, MappingStrictnessLevel } from "../model/Mapping";

/**
 * Mapping event types.
 */
export enum MappingEventType {
  CreatedV1 = "MappingCreatedV1",
  PropertiesUpdatedV1 = "MappingPropertiesUpdatedV1",
  StrictnessChangedV1 = "MappingStrictnessChangedV1",
  DeletedV1 = "MappingDeletedV1"
}

/**
 * Mapping event.
 */
export interface MappingEvent extends Event {
  readonly eventType: MappingEventType;
}

/**
 * Mapping created event (version 1).
 */
export interface MappingCreatedV1 extends MappingEvent {
  readonly eventType: MappingEventType.CreatedV1;
  readonly payload: MappingCreatedV1Payload;
}

export interface MappingCreatedV1Payload {
  readonly strictness: MappingStrictnessLevel;
  readonly name: string;
  readonly properties: MappingProperties;
}

/**
 * Mapping properties updated event (version 1).
 */
export interface MappingPropertiesUpdatedV1 extends MappingEvent {
  readonly eventType: MappingEventType.PropertiesUpdatedV1;
  readonly payload: MappingPropertiesUpdatedV1Payload;
}

export interface MappingPropertiesUpdatedV1Payload {
  readonly properties: MappingProperties;
}

/**
 * Mapping type changed event (version 1).
 */
export interface MappingStrictnessChangedV1 extends MappingEvent {
  readonly eventType: MappingEventType.StrictnessChangedV1;
  readonly payload: MappingStrictnessChangedV1Payload;
}

export interface MappingStrictnessChangedV1Payload {
  readonly strictness: MappingStrictnessLevel;
}

/**
 * Mapping deleted event (version 1).
 */
export interface MappingDeletedV1 extends MappingEvent {
  readonly eventType: MappingEventType.DeletedV1;
}
