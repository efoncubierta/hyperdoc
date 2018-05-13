import { DynamoDB } from "aws-sdk";
import { INode, INodeKey } from "../model/INode";

export default interface INodeStore {
  /**
   * Get a node by its UUID.
   *
   * @param {string} uuid - Node UUID
   * @returns {Promise<INode>} A promise that contains the node, or null if missing
   */
  get(uuid: string): Promise<INode>;

  /**
   * Create a node.
   *
   * @param {INode} node - Node
   * @returns {Promise<INode>} A promise that contains the saved node
   */
  save(node: INode): Promise<INode>;
}
