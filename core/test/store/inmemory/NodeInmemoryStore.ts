import * as _ from "underscore";
import { Node } from "../../../src/model/Node";
import NodeStore from "../../../src/store/NodeStore";

/**
 * Manage node data in memory.
 */
export default class NodeInmemoryStore implements NodeStore {
  private nodes: Node[] = [];

  public get(uuid: string): Promise<Node> {
    const node = _.find(this.nodes, (i) => {
      return i.uuid === uuid;
    });

    return Promise.resolve(node);
  }

  public save(node: Node): Promise<Node> {
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
