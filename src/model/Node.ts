import { Audit } from "./Audit";

/**
 * Node.
 */
export interface Node {
  id: NodeId;
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
export type NodeKey = Pick<Node, "id">;

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
