// external dependencies
import * as UUID from "uuid";
import { Active } from "eventum-sdk";

// models
import { Audit } from "../model/Audit";
import { Node, NodeProperties, NodeBuilder } from "../model/Node";
import { Mapping } from "../model/Mapping";

// model schema
import { NodeValidator } from "../validation/NodeValidator";
import { NodeSchema, NodePropertiesSchema } from "../validation/schemas/NodeSchema";

// aggregate
import { NodeAggregate } from "../aggregate/NodeAggregate";

// node messages
import { GetNode } from "../message/command/GetNode";
import { CreateNode } from "../message/command/CreateNode";
import { SetNodeProperties } from "../message/command/SetNodeProperties";

import { ExecutionContext } from "./ExecutionContext";
import { StoreFactory } from "../store/StoreFactory";
import { MappingService } from "./MappingService";

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
    return StoreFactory.getNodeStore().get(uuid);
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

    // new node UUID
    const uuid = UUID.v1();

    return MappingService.getByName(context, mappingName)
      .then((mapping) => {
        // validate properties
        NodeService.validateNodeProperties(properties, mapping);

        // get the aggregate for the new node
        return NodeService.getAggregate(uuid);
      })
      .then((aggregate) => {
        // node aggregate checks whether the node already exist before executing the CreateNode command
        return aggregate.handle(new CreateNode(mappingName, properties));
      })
      .then((state) => {
        // if aggregate is active, then return the node. Fail otherwise
        switch (state.stateName) {
          case Active.STATE_NAME:
            return (state as Active<Node>).payload;
          default:
            throw new Error(`Node ${uuid} is in an inconsistent state`);
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

    // get the node to be updated
    return NodeService.get(context, uuid)
      .then((node) => {
        if (!node) {
          throw new Error(`Node ${uuid} does not exist`);
        }

        // get its mapping
        return MappingService.getByName(context, node.mapping);
      })
      .then((mapping) => {
        // validate properties
        NodeService.validateNodeProperties(properties, mapping);

        // get node aggregate
        return NodeService.getAggregate(uuid);
      })
      .then((aggregate) => {
        // mapping aggregate check whether the mapping exist before executing the SetNodeProperties command
        return aggregate.handle(new SetNodeProperties(properties));
      })
      .then((state) => {
        // if aggregate is active, then return the mapping. Otherwise return null
        switch (state.stateName) {
          case Active.STATE_NAME:
            return (state as Active<Node>).payload;
          default:
            throw new Error(`Mapping ${uuid} is in an inconsistent state`);
        }
      });
  }

  /**
   * Validate a node properties against a mapping.
   *
   * @param {NodeProperties} nodeProperties - Node properties
   * @param {Mapping} mapping - Mapping
   * @throws An error if the validation doesn't pass
   */
  private static validateNodeProperties(nodeProperties: NodeProperties, mapping: Mapping) {
    // get a validator for the mapping or default node validator if new mapping
    const validator = mapping ? NodeValidator.getValidatorFromMapping(mapping) : NodeValidator.getDefaultValidator();

    // validate node against the JSON schema and process errors
    const result = validator.validate(nodeProperties, NodePropertiesSchema);
    if (result.errors.length > 0) {
      // TODO handle multiple errors
      throw new Error(result.errors[0].message);
    }
  }

  private static getAggregate(uuid: string): Promise<NodeAggregate> {
    return NodeAggregate.build(uuid);
  }
}
