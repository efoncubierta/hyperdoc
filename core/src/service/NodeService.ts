import * as UUID from "uuid";

import { NodeKey, NodeProperties, Node, NodeBuilder } from "../model/Node";
import { ExecutionContext } from "../model/ExecutionContext";
import { MappingService } from "..";
import { Mapping } from "../model/Mapping";

import NodeValidator from "../validation/NodeValidator";
import { NodeSchema } from "../validation/schemas/Node";
import { Audit } from "../model/Audit";

/**
 * Service to manage nodes from the user space.
 */
export default class NodeService {
  /**
   * Get a node.
   *
   * @param {ExecutionContext} context - Execution context
   * @param {string} uuid - Node UUID
   * @returns {Promise<Node>} A promise that contains the node, or null if missing
   */
  public static get(context: ExecutionContext, uuid: string): Promise<Node> {
    return context.stores.nodes.get(uuid).then((node) => {
      // TODO check permissions
      return node;
    });
  }

  /**
   * Create a new node.
   *
   * @param {ExecutionContext} context - Execution context
   * @param {string} mappingName - Name of the mapping
   * @param {NodeProperties} properties - Node properties
   * @returns {Promise<Node>} A promise that contains the node just created
   */
  public static create(context: ExecutionContext, mappingName: string, properties: NodeProperties): Promise<Node> {
    return MappingService.getByName(context, mappingName).then((mapping) => {
      // TODO check permissions

      // set audit data
      const now = new Date();
      const audit: Audit = {
        createdAt: now.toISOString(),
        createdBy: context.auth.userUuid,
        modifiedAt: now.toISOString(),
        modifiedBy: context.auth.userUuid
      };

      // build node with new UUID
      const node = new NodeBuilder()
        .uuid(UUID.v1())
        .mapping(mappingName)
        .properties(properties)
        .audit(audit)
        .build();

      // validate node before saving it
      this.validateNode(node, mapping);

      return context.stores.nodes.save(node);
    });
  }

  /**
   * Set node properties.
   *
   * @param {ExecutionContext} context - Execution context
   * @param {string} uuid - Node UUID
   * @param {NodeProperties} properties - Node properties
   * @returns {Promise<Node>} A promise that contains the node just updated
   */
  public static setProperties(context: ExecutionContext, uuid: string, properties: NodeProperties): Promise<Node> {
    return this.getOrError(context, uuid).then((node) => {
      // TODO check permissions

      return MappingService.getByName(context, node.mapping).then((mapping) => {
        // set audit data
        const now = new Date();
        const audit: Audit = {
          createdAt: node.audit.createdAt,
          createdBy: node.audit.createdBy,
          modifiedAt: now.toISOString(),
          modifiedBy: context.auth.userUuid
        };

        // set new node details
        const newNode = new NodeBuilder(node).properties(properties).build();

        // validate node before saving it
        this.validateNode(newNode, mapping);

        // ... and save it
        return context.stores.nodes.save(newNode);
      });
    });
  }

  /**
   * Get a node or fail.
   *
   * @param {ExecutionContext} context - Execution context
   * @param {string} uuid - Node UUID
   * @returns {Promise<Node>} A promise that contains the node, or it gets rejected
   */
  private static getOrError(context: ExecutionContext, uuid: string): Promise<Node> {
    return this.get(context, uuid).then((node) => {
      // does the node exist?
      if (!node) {
        throw new Error(`Node ${uuid} does not exist`);
      }

      return node;
    });
  }

  /**
   * Validate a node against a mapping.
   *
   * @param {Node} node - Node
   * @param {Mapping} mapping - Mapping
   * @throws An error if the validation doesn't pass
   */
  private static validateNode(node: Node, mapping: Mapping) {
    // get a validator for the mapping or default node validator if new mapping
    const validator = mapping ? NodeValidator.getValidatorFromMapping(mapping) : NodeValidator.getDefaultValidator();

    // validate node against the JSON schema and process errors
    const result = validator.validate(node, NodeSchema);
    if (result.errors.length > 0) {
      // TODO handle multiple errors
      throw new Error(result.errors[0].message);
    }
  }
}
