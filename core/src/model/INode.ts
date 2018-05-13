import { IAudit } from "./IAudit";
import { IMappingRef, IMappingKey } from "./IMapping";

/**
 * Node unique key.
 */
export interface INodeKey {
  uuid: string;
}

/**
 * Node reference.
 */
export interface INodeRef {
  nodeKey: INodeKey;
}

/**
 * Node properties.
 */
export interface INodeProperties {
  [x: string]: string | number | boolean | INodeProperties | INodePropertiesArray;
}

/**
 * Array of node properties.
 */
export interface INodePropertiesArray
  extends Array<string | number | boolean | INodeProperties | INodePropertiesArray> {}

/**
 * Node.
 */
export interface INode extends INodeKey {
  mapping: string;
  properties: INodeProperties;
  audit: IAudit;
}

/**
 * Node builder.
 *
 * NOTE: this builder is not great. It comes with many problems.
 */
export class NodeBuilder {
  private n: INode;

  constructor(node?: INode) {
    this.n = node ? node : ({} as INode);
  }

  public uuid(uuid: string): NodeBuilder {
    this.n.uuid = uuid;
    return this;
  }

  public mapping(mapping: string): NodeBuilder {
    this.n.mapping = mapping;
    return this;
  }

  public properties(properties: INodeProperties): NodeBuilder {
    this.n.properties = properties;
    return this;
  }

  public audit(audit: IAudit): NodeBuilder {
    this.n.audit = audit;
    return this;
  }

  public build(): INode {
    return this.n;
  }
}
