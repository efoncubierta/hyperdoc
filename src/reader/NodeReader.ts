// External dependencies
import { Option } from "fp-ts/lib/Option";

// Hyperdoc
import { ExecutionContext } from "../ExecutionContext";

// Hyperdoc models
import { Node, NodeId, NodeStateName } from "../model/Node";

// Hyperdoc aggregates
import { NodeAggregate } from "../aggregate/NodeAggregate";

// Hyperdoc stores
import { StoreFactory } from "../store/StoreFactory";

/**
 * Service to manage nodes from the user space.
 */
export class NodeReader {
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
   * Check whether a node exists.
   *
   * @param context Execution context
   * @param nodeId Node ID
   */
  public static exists(context: ExecutionContext, nodeId: NodeId): Promise<boolean> {
    return NodeReader.isInState(context, nodeId, [NodeStateName.Enabled, NodeStateName.Disabled, NodeStateName.Locked]);
  }

  /**
   * Check whether a node is enabled.
   *
   * @param context Execution context
   * @param nodeId Node ID
   */
  public static isEnabled(context: ExecutionContext, nodeId: NodeId): Promise<boolean> {
    return NodeReader.isInState(context, nodeId, [NodeStateName.Enabled]);
  }

  /**
   * Check whether a node is disabled.
   *
   * @param context Execution context
   * @param nodeId Node ID
   */
  public static isDisabled(context: ExecutionContext, nodeId: NodeId): Promise<boolean> {
    return NodeReader.isInState(context, nodeId, [NodeStateName.Disabled]);
  }

  /**
   * Check whether a node is locked.
   *
   * @param context Execution context
   * @param nodeId Node ID
   */
  public static isLocked(context: ExecutionContext, nodeId: NodeId): Promise<boolean> {
    return NodeReader.isInState(context, nodeId, [NodeStateName.Locked]);
  }

  /**
   * Check whether a node is unlocked.
   *
   * @param context Execution context
   * @param nodeId Node ID
   */
  public static isUnlocked(context: ExecutionContext, nodeId: NodeId): Promise<boolean> {
    return NodeReader.isInState(context, nodeId, [NodeStateName.Enabled, NodeStateName.Disabled]);
  }

  /**
   * Check whether a node is deleted.
   *
   * @param context Execution context
   * @param nodeId Node ID
   */
  public static isDeleted(context: ExecutionContext, nodeId: NodeId): Promise<boolean> {
    return NodeReader.isInState(context, nodeId, [NodeStateName.Deleted]);
  }

  private static isInState(
    context: ExecutionContext,
    nodeId: NodeId,
    expectedStates: NodeStateName[]
  ): Promise<boolean> {
    return NodeReader.getAggregate(context, nodeId).then((aggregate) => {
      const state = aggregate.get();
      return expectedStates.indexOf(state.name) >= 0;
    });
  }

  private static getAggregate(context: ExecutionContext, nodeId: NodeId): Promise<NodeAggregate> {
    return NodeAggregate.build(context, nodeId);
  }
}
