import { Node } from "../model/Node";

export interface NodeStore {
  get(uuid: string): Promise<Node>;
  put(node: Node): Promise<void>;
  delete(uuid: string): Promise<void>;
}
