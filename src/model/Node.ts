import { Audit } from "./Audit";

/**
 * Node.
 */
export interface Node {
  nodeId: NodeId;
  mappingName: string;
  properties: NodeProperties;
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
export type NodePropertyType = string | number | boolean | NodeProperties | NodePropertiesArray;

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
