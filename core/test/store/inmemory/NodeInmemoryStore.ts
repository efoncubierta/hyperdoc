import * as _ from "underscore";
import { INode } from "../../../src/model/INode";
import INodeStore from "../../../src/store/INodeStore";

/**
 * Manage node data in memory.
 */
export default class NodeInmemoryStore implements INodeStore {
  private nodes: INode[] = [];

  public get(uuid: string): Promise<INode> {
    const node = _.find(this.nodes, (i) => {
      return i.uuid === uuid;
    });

    return Promise.resolve(node);
  }

  public save(node: INode): Promise<INode> {
    // remove existing node with same UUID
    this.nodes = _.filter(this.nodes, (i) => {
      return i.uuid !== node.uuid;
    });

    // push node to the array
    this.nodes.push(node);

    // return saved node
    return Promise.resolve(node);
  }
}
