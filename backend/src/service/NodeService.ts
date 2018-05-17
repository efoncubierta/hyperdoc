import * as UUID from "uuid";

import { Node, NodeProperties, Audit, NodeBuilder, Mapping, NodeValidator, NodeSchema } from "hyperdoc-core";
import { ExecutionContext } from "./ExecutionContext";
import { NodeAggregate } from "../aggregate/NodeAggregate";
import { Active } from "hyperdoc-eventstore";
import { GetNode } from "../message/command/GetNode";
import { CreateNode } from "../message/command/CreateNode";
import { SetNodeProperties } from "../message/command/SetNodeProperties";

/**
 * Service to manage nodes from the user space.
 */
export class NodeService {
  /**
   * Get a node.
   *
   * @param {ExecutionContext} context - Execution context
   * @param {string} uuid - Node UUID
   * @returns {Promise<Node>} A promise that contains the node, or null if missing
   */
  public static get(context: ExecutionContext, uuid: string): Promise<Node> {
    return this.getAggregate(context, uuid)
      .handle(new GetNode())
      .then((state) => {
        // if aggregate is active, then return the mapping. Otherwise return null
        switch (state.$state) {
          case Active.NAME:
            return (state as Active<Node>).data;
          default:
            return null;
        }
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
    // TODO validation
    // TODO check permissions

    return this.getAggregate(context, UUID.v1())
      .handle(new CreateNode(mappingName, properties))
      .then((state) => {
        // if aggregate is active, then return the mapping. Otherwise return null
        switch (state.$state) {
          case Active.NAME:
            return (state as Active<Node>).data;
          default:
            return null;
        }
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
    // TODO validation
    // TODO check permissions

    return this.getAggregate(context, UUID.v1())
      .handle(new SetNodeProperties(properties))
      .then((state) => {
        // if aggregate is active, then return the mapping. Otherwise return null
        switch (state.$state) {
          case Active.NAME:
            return (state as Active<Node>).data;
          default:
            return null;
        }
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

  private static getAggregate(context: ExecutionContext, uuid: string): NodeAggregate {
    return new NodeAggregate(uuid, context.aggregate.config);
  }
}
