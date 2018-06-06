import { EventInput } from "eventum-sdk";
import { NodeProperties } from "../model/Node";

/**
 * Node event types.
 */
export enum NodeEventType {
  CreatedV1 = "NodeCreatedV1",
  PropertiesUpdatedV1 = "NodePropertiesUpdatedV1",
  EnabledV1 = "NodeEnabledV1",
  DisabledV1 = "NodeDisabledV1",
  LockedV1 = "NodeLockedV1",
  UnlockedV1 = "NodeUnlockedV1",
  DeletedV1 = "NodeDeletedV1"
}

/**
 * Node event.
 */
export interface NodeEvent extends EventInput {
  readonly eventType: NodeEventType;
}

/**
 * Node created event (version 1).
 */
export interface NodeCreatedV1 extends NodeEvent {
  readonly eventType: NodeEventType.CreatedV1;
  readonly payload: {
    readonly mappingName: string;
    readonly properties: NodeProperties;
  };
}

/**
 * Node properties updated event (version 1).
 */
export interface NodePropertiesUpdatedV1 extends NodeEvent {
  readonly eventType: NodeEventType.PropertiesUpdatedV1;
  readonly payload: {
    readonly properties: NodeProperties;
  };
}

/**
 * Node enabled event (version 1).
 */
export interface NodeEnabledV1 extends NodeEvent {
  readonly eventType: NodeEventType.EnabledV1;
}

/**
 * Node disabled event (version 1).
 */
export interface NodeDisabledV1 extends NodeEvent {
  readonly eventType: NodeEventType.DisabledV1;
  readonly payload: {
    readonly reason: string;
  };
}

/**
 * Node locked event (version 1).
 */
export interface NodeLockedV1 extends NodeEvent {
  readonly eventType: NodeEventType.LockedV1;
}

/**
 * Node unlocked event (version 1).
 */
export interface NodeUnlockedV1 extends NodeEvent {
  readonly eventType: NodeEventType.UnlockedV1;
}

/**
 * Node deleted event (version 1).
 */
export interface NodeDeletedV1 extends NodeEvent {
  readonly eventType: NodeEventType.DeletedV1;
}
