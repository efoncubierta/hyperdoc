import * as UUID from "uuid";

import { INodeKey, INodeProperties, INode, NodeBuilder } from "../model/INode";
import { IExecutionContext } from "../model/IExecutionContext";
import { MappingService } from "..";
import { IMapping } from "../model/IMapping";

import NodeValidator from "../validation/NodeValidator";
import { NodeSchema } from "../validation/schemas/Node";
import { IAudit } from "../model/IAudit";

/**
 * Service to manage nodes from the user space.
 */
export default class NodeService {
  /**
   * Get a node.
   *
   * @param {IExecutionContext} context - Execution context
   * @param {string} uuid - Node UUID
   * @returns {Promise<INode>} A promise that contains the node, or null if missing
   */
  public static get(context: IExecutionContext, uuid: string): Promise<INode> {
    return context.stores.nodes.get(uuid).then((node) => {
      // TODO check permissions
      return node;
    });
  }

  /**
   * Create a new node.
   *
   * @param {IExecutionContext} context - Execution context
   * @param {string} mappingName - Name of the mapping
   * @param {INodeProperties} properties - Node properties
   * @returns {Promise<INode>} A promise that contains the node just created
   */
  public static create(context: IExecutionContext, mappingName: string, properties: INodeProperties): Promise<INode> {
    return MappingService.getByName(context, mappingName).then((mapping) => {
      // TODO check permissions

      // set audit data
      const now = new Date();
      const audit: IAudit = {
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
   * @param {IExecutionContext} context - Execution context
   * @param {string} uuid - Node UUID
   * @param {INodeProperties} properties - Node properties
   * @returns {Promise<INode>} A promise that contains the node just updated
   */
  public static setProperties(context: IExecutionContext, uuid: string, properties: INodeProperties): Promise<INode> {
    return this.getOrError(context, uuid).then((node) => {
      // TODO check permissions

      return MappingService.getByName(context, node.mapping).then((mapping) => {
        // set audit data
        const now = new Date();
        const audit: IAudit = {
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
   * @param {IExecutionContext} context - Execution context
   * @param {string} uuid - Node UUID
   * @returns {Promise<INode>} A promise that contains the node, or it gets rejected
   */
  private static getOrError(context: IExecutionContext, uuid: string): Promise<INode> {
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
   * @param {INode} node - Node
   * @param {IMapping} mapping - Mapping
   * @throws An error if the validation doesn't pass
   */
  private static validateNode(node: INode, mapping: IMapping) {
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
