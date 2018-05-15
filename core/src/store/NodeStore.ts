import { DynamoDB } from "aws-sdk";
import { Node, NodeKey } from "../model/Node";

export default interface NodeStore {
  /**
   * Get a node by its UUID.
   *
   * @param {string} uuid - Node UUID
   * @returns {Promise<Node>} A promise that contains the node, or null if missing
   */
  get(uuid: string): Promise<Node>;

  /**
   * Create a node.
   *
   * @param {Node} node - Node
   * @returns {Promise<Node>} A promise that contains the saved node
   */
  save(node: Node): Promise<Node>;
}
