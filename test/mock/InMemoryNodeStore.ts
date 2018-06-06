import { NodeStore } from "../../src/store/NodeStore";
import { Node, NodeId } from "../../src/model/Node";

export class InMemoryNodeStore {
  private static nodes: Node[] = [];

  public static get(nodeId: NodeId): Node {
    return InMemoryNodeStore.nodes.find((node) => {
      return node.nodeId === nodeId;
    });
  }

  public static put(node: Node): void {
    InMemoryNodeStore.delete(node.nodeId);
    InMemoryNodeStore.nodes.push(node);
  }

  public static delete(nodeId: NodeId): void {
    InMemoryNodeStore.nodes = InMemoryNodeStore.nodes.filter((node) => {
      return !(node.nodeId === nodeId);
    });
  }
}
