import { Audit } from "./Audit";
import { HRN } from "./HRN";

/**
 * Node.
 */
export interface Node {
  readonly nodeId: NodeId;
  readonly mappingName: string;
  readonly properties: NodeProperties;
  // audit: Audit;
}

/**
 * Node id.
 */
export type NodeId = string;

/**
 * Node key.
 */
export type NodeKey = Pick<Node, "nodeId">;

/**
 * Node properties.
 */
export interface NodeProperties {
  [x: string]: NodePropertyType;
}

/**
 * Array of node properties.
 */
export interface NodePropertiesArray extends Array<string | number | boolean> {}

/**
 * Allowed values for a node property.
 */
export type NodePropertyType = string | number | boolean | HRN | NodeProperties | NodePropertiesArray;

/**
 * Node state names.
 */
export enum NodeStateName {
  New = "New",
  Enabled = "Enabled",
  Locked = "Locked",
  Disabled = "Disabled",
  Deleted = "Deleted"
}

/**
 * Node state.
 */
export interface NodeState {
  readonly name: NodeStateName;
  readonly node?: Node;
}
