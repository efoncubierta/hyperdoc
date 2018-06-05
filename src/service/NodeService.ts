// External dependencies
import * as UUID from "uuid";
import { Option } from "fp-ts/lib/Option";

// Hyperdoc models
import { Audit } from "../model/Audit";
import { Node, NodeProperties, NodeId } from "../model/Node";
import { Mapping } from "../model/Mapping";

// Hyperdoc model schemas
import { NodeValidator } from "../validation/NodeValidator";
import { NodeSchema, NodePropertiesSchema } from "../validation/schemas/NodeSchema";

// Hyperdoc aggregates
import { NodeAggregate } from "../aggregate/NodeAggregate";
import { NodeStateName } from "../aggregate/NodeStateName";

// Hyperdoc services
import { MappingService } from "./MappingService";
import { ExecutionContext } from "./ExecutionContext";

// Hyperdoc stores
import { StoreFactory } from "../store/StoreFactory";

/**
 * Service to manage nodes from the user space.
 */
export class NodeService {
  /**
   * Get a node.
   *
   * @param context Execution context
   * @param nodeId Node ID
   *
   * @returns A promise that resolves to an optional node
   */
  public static get(context: ExecutionContext, nodeId: NodeId): Promise<Option<Node>> {
    return StoreFactory.getNodeStore().get(nodeId);
  }

  /**
   * Create a new node.
   *
   * @param context Execution context
   * @param mappingName Name of the mapping
   * @param nodeProperties Node properties
   *
   * @returns A promise that resolves the node just created
   */
  public static create(context: ExecutionContext, mappingName: string, nodeProperties: NodeProperties): Promise<Node> {
    // TODO validation
    // TODO check permissions

    // new node UUID
    const nodeId = UUID.v1();

    return MappingService.getByName(context, mappingName)
      .then((mappingOpt) => {
        // validate properties
        NodeService.validateNodeProperties(nodeProperties, mappingOpt.getOrElse(null));

        // get the aggregate for the new node
        return NodeService.getAggregate(nodeId);
      })
      .then((aggregate) => {
        // node aggregate checks whether the node already exist before creating it
        return aggregate.create(mappingName, nodeProperties);
      })
      .then((state) => {
        // if aggrnodeegate is active, then return it. Fail otherwise
        switch (state.stateName) {
          case NodeStateName.Active:
            return state.payload;
          default:
            throw new Error(`Node ${nodeId} is in an inconsistent state`);
        }
      });
  }

  /**
   * Set node properties.
   *
   * @param context Execution context
   * @param nodeId Node UUID
   * @param nodeProperties Node properties
   *
   * @returns A promise that resolves the node just updated
   */
  public static setProperties(
    context: ExecutionContext,
    nodeId: NodeId,
    nodeProperties: NodeProperties
  ): Promise<Node> {
    // TODO validation
    // TODO check permissions

    // get the node to be updated
    return NodeService.get(context, nodeId)
      .then((nodeOpt) => {
        // get the node mapping, or throw and error if the node does not exist
        return nodeOpt.foldL(
          () => {
            throw new Error(`Node ${nodeId} does not exist`);
          },
          (node) => {
            return MappingService.getByName(context, node.mappingName);
          }
        );
      })
      .then((mappingOpt) => {
        // validate properties
        NodeService.validateNodeProperties(nodeProperties, mappingOpt.getOrElse(null));

        // get node aggregate
        return NodeService.getAggregate(nodeId);
      })
      .then((aggregate) => {
        // mapping aggregate check whether the mapping exist before executing the SetNodeProperties command
        return aggregate.setProperties(nodeProperties);
      })
      .then((state) => {
        // if node is active, then return it. Fail otherwise
        switch (state.stateName) {
          case NodeStateName.Active:
            return state.payload;
          default:
            throw new Error(`Node ${nodeId} is in an inconsistent state`);
        }
      });
  }

  /**
   * Validate a node properties against a mapping.
   *
   * @param nodeProperties Node properties
   * @param mapping Mapping
   *
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

  private static getAggregate(nodeId: NodeId): Promise<NodeAggregate> {
    return NodeAggregate.build(nodeId);
  }
}
