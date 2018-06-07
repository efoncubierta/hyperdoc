// External dependencies
import * as UUID from "uuid";
import { Option } from "fp-ts/lib/Option";

// Hyperdoc models
import { Audit } from "../model/Audit";
import { Node, NodeProperties, NodeId, NodeStateName, NodeState } from "../model/Node";
import { Mapping } from "../model/Mapping";

// Hyperdoc model schemas
import { SchemaValidator } from "../validation/SchemaValidator";
import { NodeSchema, NodePropertiesSchema } from "../validation/schemas/NodeSchema";

// Hyperdoc aggregates
import { NodeAggregate } from "../aggregate/NodeAggregate";

// Hyperdoc services
import { MappingService } from "./MappingService";
import { ExecutionContext } from "./ExecutionContext";

// Hyperdoc stores
import { StoreFactory } from "../store/StoreFactory";
import { NodeServiceError } from "./NodeServiceError";

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
   * @param properties Node properties
   *
   * @returns A promise that resolves the node just created
   */
  public static create(context: ExecutionContext, mappingName: string, properties: NodeProperties): Promise<Node> {
    // TODO check permissions

    // new node UUID
    const nodeId = UUID.v1();

    return MappingService.getByName(context, mappingName).then((mappingOpt) => {
      // validate properties
      const mapping = mappingOpt.fold(undefined, (m) => m);
      NodeService.validateNodeProperties(properties, mapping);

      // invoke create() in the aggregate. New state must be "Enabled"
      return NodeService.runAggregate(nodeId)((aggregate) => aggregate.create(mappingName, properties), [
        NodeStateName.Enabled
      ]);
    });
  }

  /**
   * Set node properties.
   *
   * @param context Execution context
   * @param nodeId Node UUID
   * @param properties Node properties
   *
   * @returns A promise that resolves the node just updated
   */
  public static setProperties(context: ExecutionContext, nodeId: NodeId, properties: NodeProperties): Promise<Node> {
    // TODO check permissions

    // get the node to be updated
    return NodeService.get(context, nodeId)
      .then((nodeOpt) => {
        // get the node mapping, or throw and error if the node does not exist
        return nodeOpt.foldL(
          () => {
            throw new NodeServiceError(`Node ${nodeId} does not exist`);
          },
          (node) => {
            return MappingService.getByName(context, node.mappingName);
          }
        );
      })
      .then((mappingOpt) => {
        // validate properties
        const mapping = mappingOpt.fold(undefined, (m) => m);
        NodeService.validateNodeProperties(properties, mapping);

        // invoke setProperties() in the aggregate. New state must be "Enabled"
        return NodeService.runAggregate(nodeId)((aggregate) => aggregate.setProperties(properties), [
          NodeStateName.Enabled
        ]);
      });
  }

  public static delete(context: ExecutionContext, nodeId: NodeId): Promise<Node> {
    // invoke delete() in the aggregate. New state must be "Deleted" and has no payload
    return NodeService.runAggregate(nodeId)((aggregate) => aggregate.delete(), [NodeStateName.Deleted], false);
  }

  public static enable(context: ExecutionContext, nodeId: NodeId): Promise<Node> {
    // invoke lock() in the aggregate. New state must be "Enabled"
    return NodeService.runAggregate(nodeId)((aggregate) => aggregate.enable(), [NodeStateName.Enabled]);
  }

  public static disable(context: ExecutionContext, nodeId: NodeId, reason: string): Promise<Node> {
    // invoke lock() in the aggregate. New state must be "Enabled"
    return NodeService.runAggregate(nodeId)((aggregate) => aggregate.disable(reason), [NodeStateName.Disabled]);
  }

  public static lock(context: ExecutionContext, nodeId: NodeId): Promise<Node> {
    // invoke lock() in the aggregate. New state must be "Locked"
    return NodeService.runAggregate(nodeId)((aggregate) => aggregate.lock(), [NodeStateName.Locked]);
  }

  public static unlock(context: ExecutionContext, nodeId: NodeId): Promise<Node> {
    // invoke lock() in the aggregate. New state must be "Enabled"
    return NodeService.runAggregate(nodeId)((aggregate) => aggregate.unlock(), [NodeStateName.Enabled]);
  }

  public static exists(context: ExecutionContext, nodeId: NodeId): Promise<boolean> {
    return NodeService.isInState(nodeId, [NodeStateName.Enabled, NodeStateName.Disabled, NodeStateName.Locked]);
  }

  public static isEnabled(context: ExecutionContext, nodeId: NodeId): Promise<boolean> {
    return NodeService.isInState(nodeId, [NodeStateName.Enabled]);
  }

  public static isDisabled(context: ExecutionContext, nodeId: NodeId): Promise<boolean> {
    return NodeService.isInState(nodeId, [NodeStateName.Disabled]);
  }

  public static isLocked(context: ExecutionContext, nodeId: NodeId): Promise<boolean> {
    return NodeService.isInState(nodeId, [NodeStateName.Locked]);
  }

  public static isUnlocked(context: ExecutionContext, nodeId: NodeId): Promise<boolean> {
    return NodeService.isInState(nodeId, [NodeStateName.Enabled, NodeStateName.Disabled]);
  }

  public static isDeleted(context: ExecutionContext, nodeId: NodeId): Promise<boolean> {
    return NodeService.isInState(nodeId, [NodeStateName.Deleted]);
  }

  private static isInState(nodeId: NodeId, expectedStates: NodeStateName[]): Promise<boolean> {
    return NodeService.getAggregate(nodeId).then((aggregate) => {
      const state = aggregate.get();
      return expectedStates.indexOf(state.name) >= 0;
    });
  }

  private static runAggregate(nodeId: NodeId): RunAggregateF {
    return (invoke: AggregateInvokeF, expectedStates: NodeStateName[], hasPayload: boolean = true) => {
      return NodeService.getAggregate(nodeId)
        .then((aggregate) => {
          return invoke(aggregate);
        })
        .then((nodeState) => {
          if (expectedStates.indexOf(nodeState.name) >= 0 && (!hasPayload || nodeState.node)) {
            return nodeState.node;
          } else {
            throw new NodeServiceError(`Node ${nodeId} is in an inconsistent state`);
          }
        });
    };
  }

  /**
   * Validate a node properties against a mapping.
   *
   * @param properties Node properties
   * @param mapping Mapping
   *
   * @throws An error if the validation doesn't pass
   */
  private static validateNodeProperties(properties: NodeProperties, mapping?: Mapping) {
    // get a validator for the mapping or default node validator if new mapping
    const validator = mapping
      ? SchemaValidator.getModelValidatorFromMapping(mapping)
      : SchemaValidator.getModelValidator();

    // validate node against the JSON schema and process errors
    const result = validator.validate(properties, NodePropertiesSchema);
    if (result.errors.length > 0) {
      throw new NodeServiceError(result.errors[0].message);
    }
  }

  private static getAggregate(nodeId: NodeId): Promise<NodeAggregate> {
    return NodeAggregate.build(nodeId);
  }
}

type AggregateInvokeF = (aggregate: NodeAggregate) => Promise<NodeState>;
type RunAggregateF = (invoke: AggregateInvokeF, expectedStates: NodeStateName[], hasPayload?: boolean) => Promise<Node>;
