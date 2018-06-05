// External dependencies
import { Option } from "fp-ts/lib/Option";

// Hyperdoc models
import { Node } from "../model/Node";

export interface NodeStore {
  get(uuid: string): Promise<Option<Node>>;
  put(node: Node): Promise<void>;
  delete(uuid: string): Promise<void>;
}
