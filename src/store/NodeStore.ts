// External dependencies
import { Option } from "fp-ts/lib/Option";

// Hyperdoc models
import { Node, NodeId } from "../model/Node";

export interface NodeStore {
  get(nodeId: NodeId): Promise<Option<Node>>;
  put(node: Node): Promise<void>;
  delete(nodeId: NodeId): Promise<void>;
}
