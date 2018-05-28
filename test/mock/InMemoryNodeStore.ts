import { NodeStore } from "../../src/store/NodeStore";
import { Node } from "../../src/model";

export class InMemoryNodeStore {
  private static nodes: Node[] = [];

  public static get(uuid: string): Node {
    return InMemoryNodeStore.nodes.find((node) => {
      return node.uuid === uuid;
    });
  }

  public static put(node: Node): void {
    InMemoryNodeStore.delete(node.uuid);
    InMemoryNodeStore.nodes.push(node);
  }

  public static delete(uuid: string): void {
    InMemoryNodeStore.nodes = InMemoryNodeStore.nodes.filter((node) => {
      return !(node.uuid === uuid);
    });
  }
}
