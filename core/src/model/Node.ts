import { Audit } from "./Audit";
import { MappingRef, MappingKey } from "./Mapping";

/**
 * Node unique key.
 */
export interface NodeKey {
  uuid: string;
}

/**
 * Node reference.
 */
export interface NodeRef {
  nodeKey: NodeKey;
}

/**
 * Allowed values for a node property.
 */
export type NodePropertyType = string | number | boolean | NodeProperties | NodePropertiesArray;
/**
 * Node properties.
 */
export interface NodeProperties {
  [x: string]: NodePropertyType;
}

/**
 * Array of node properties.
 */
export interface NodePropertiesArray
  extends Array<string | number | boolean> {}

/**
 * Node.
 */
export interface Node extends NodeKey {
  mapping: string;
  properties: NodeProperties;
  audit: Audit;
}

/**
 * Node builder.
 *
 * NOTE: this builder is not great. It comes with many problems.
 */
export class NodeBuilder {
  private n: Node;

  constructor(node?: Node) {
    this.n = node ? node : ({} as Node);
  }

  public uuid(uuid: string): NodeBuilder {
    this.n.uuid = uuid;
    return this;
  }

  public mapping(mapping: string): NodeBuilder {
    this.n.mapping = mapping;
    return this;
  }

  public properties(properties: NodeProperties): NodeBuilder {
    this.n.properties = properties;
    return this;
  }

  public audit(audit: Audit): NodeBuilder {
    this.n.audit = audit;
    return this;
  }

  public build(): Node {
    return this.n;
  }
}
