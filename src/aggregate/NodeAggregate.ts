// Eventum dependencies
import { Aggregate, Snapshot, State, Event, EventInput } from "eventum-sdk";

// Hyperdoc configuration
import { Hyperdoc } from "../Hyperdoc";

// Hyperdoc models
import { Node, NodeProperties, NodeId, NodeStateName, NodeState } from "../model/Node";

// Hyperdoc events
import {
  NodeEventType,
  NodeCreatedV1,
  NodePropertiesUpdatedV1,
  NodeDeletedV1,
  NodeEvent,
  NodeLockedV1,
  NodeUnlockedV1,
  NodeDisabledV1,
  NodeEnabledV1,
  NodeCreatedV1Payload,
  NodePropertiesUpdatedV1Payload,
  NodeDisabledV1Payload
} from "../event/NodeEvent";

/**
 * Node aggregate definition.
 *
 * This aggregate manages node states.
 */
export interface INodeAggregate {
  /**
   * Create a new node.
   *
   * @param mappingName Mapping name
   * @param properties Node properties
   * @returns Promise that resolves to a node state
   */
  create(mappingName: string, properties: NodeProperties): Promise<NodeState>;

  /**
   * Set node properties.
   *
   * @param properties Node properties
   * @returns Promise that resolves to a node state
   */
  setProperties(properties: NodeProperties): Promise<NodeState>;

  /**
   * Disable a node.
   *
   * @param reason Reason why it was disabled
   */
  disable(reason: string): Promise<NodeState>;

  /**
   * Enable a node.
   */
  enable(): Promise<NodeState>;

  /**
   * Lock the node.
   */
  lock(): Promise<NodeState>;

  /**
   * Unlock the node.
   */
  unlock(): Promise<NodeState>;

  /**
   * Delete a node
   *
   * @returns Promise that resolves to a node state
   */
  delete(): Promise<NodeState>;
}

/**
 * Node aggregate.
 */
export class NodeAggregate extends Aggregate<NodeState> implements INodeAggregate {
  // default current state is New
  private currentState: NodeState = {
    name: NodeStateName.New
  };

  /**
   * Create and rehydrate a node aggregate.
   *
   * @param nodeId Node ID
   * @returns Promise that resolves to a node aggregate
   */
  public static build(nodeId: NodeId): Promise<NodeAggregate> {
    // aggregate config for node aggregate
    const aggregateConfig = Hyperdoc.config().eventum.aggregate.node;

    // create aggregate
    const nodeAggregate = new NodeAggregate(nodeId, aggregateConfig);

    return nodeAggregate.rehydrate().then(() => {
      return nodeAggregate;
    });
  }

  /**
   * Get current node state.
   */
  public get(): NodeState {
    return this.currentState;
  }

  /**
   * Create a node.
   *
   * Invariants:
   * - State is New => emit NodeCreated event
   * - State is * => fail "node already exist"
   *
   * Events:
   * - {@link NodeEventPayload.CreatedV1}
   *
   * @param mappingName Node name
   * @param properties Node properties
   * @returns A promise that resolves to a node state
   */
  public create(mappingName: string, properties: NodeProperties): Promise<NodeState> {
    switch (this.currentState.name) {
      case NodeStateName.New:
        const nodeEventPayload: NodeCreatedV1Payload = {
          mappingName,
          properties
        };
        const nodeEvent: EventInput = {
          aggregateId: this.aggregateId,
          eventType: NodeEventType.CreatedV1,
          payload: nodeEventPayload
        };
        return this.emit(nodeEvent);
      default:
        return Promise.reject(`Node ${this.aggregateId} already exists.`);
    }
  }

  /**
   * Set node properties.
   *
   * Invariants:
   * - State is Enabled => emit NodePropertiesUpdated event
   * - State is Locked => fail "node is locked"
   * - State is Disabled => faile "node is disabled"
   * - State is * => fail "node does not exist"
   *
   * Events:
   * - {@link NodeEventType.PropertiesUpdatedV1}
   *
   * @param properties Node properties
   * @returns A promise that resolves to a node state
   */
  public setProperties(properties: NodeProperties): Promise<NodeState> {
    switch (this.currentState.name) {
      case NodeStateName.Enabled:
        const nodeEventPayload: NodePropertiesUpdatedV1Payload = {
          properties
        };
        const nodeEvent: EventInput = {
          aggregateId: this.aggregateId,
          eventType: NodeEventType.PropertiesUpdatedV1,
          payload: nodeEventPayload
        };
        return this.emit(nodeEvent);
      case NodeStateName.Locked:
      case NodeStateName.Disabled:
        return Promise.reject(`Node ${this.aggregateId} cannot be updated because it is locked or disabled`);
      default:
        return Promise.reject(`Node ${this.aggregateId} cannot be updated because it does not exist`);
    }
  }

  /**
   * Delete a node.
   *
   * Invariants:
   * - State is Enabled|Disabled => emit NodeDeleted event
   * - State is Locked => fail "node is locked"
   * - State is * => fail "node does not exist"
   *
   * Events:
   * - {@link NodeEventType.DeletedV1}
   *
   * @returns A promise that resolves to a node state
   */
  public delete(): Promise<NodeState> {
    switch (this.currentState.name) {
      case NodeStateName.Enabled:
      case NodeStateName.Disabled:
        const nodeEvent: EventInput = {
          aggregateId: this.aggregateId,
          eventType: NodeEventType.DeletedV1
        };
        return this.emit(nodeEvent);
      case NodeStateName.Locked:
        return Promise.reject(`Node ${this.aggregateId} cannot be deleted because it is locked`);
      default:
        return Promise.reject(`Node ${this.aggregateId} cannot be deleted because it does not exist`);
    }
  }

  /**
   * Disable a node.
   *
   * Invariants:
   * - State is Enabled => emit NodeDisabled event
   * - State is Disabled => do nothing
   * - State is Locked => fail "node is locked"
   * - State is * => fail "node does not exist"
   *
   * Events:
   * - {@link NodeEventType.NodeDisabledV1}
   *
   * @param reason Reason why the node is disabled
   * @returns A promise that resolves to a node state
   */
  public disable(reason: string): Promise<NodeState> {
    switch (this.currentState.name) {
      case NodeStateName.Enabled:
        const nodeEventPayload: NodeDisabledV1Payload = {
          reason
        };
        const nodeEvent: EventInput = {
          aggregateId: this.aggregateId,
          eventType: NodeEventType.DisabledV1,
          payload: nodeEventPayload
        };
        return this.emit(nodeEvent);
      case NodeStateName.Disabled:
        // Node is already disabled
        return Promise.resolve(this.get());
      case NodeStateName.Locked:
        return Promise.reject(`Node ${this.aggregateId} cannot be disabled because it is locked`);
      default:
        return Promise.reject(`Node ${this.aggregateId} cannot be disabled because it does not exist`);
    }
  }

  /**
   * Enable a node.
   *
   * Invariants:
   * - State is Disabled => emit NodeEnabled event
   * - State is Enabled => do nothing
   * - State is Locked => fail "node is locked"
   * - State is * => fail "node does not exist"
   *
   * Events:
   * - {@link NodeEventType.NodeEnabledV1}
   *
   * @returns A promise that resolves to a node state
   */
  public enable(): Promise<NodeState> {
    switch (this.currentState.name) {
      case NodeStateName.Disabled:
        const nodeEvent: EventInput = {
          aggregateId: this.aggregateId,
          eventType: NodeEventType.EnabledV1
        };
        return this.emit(nodeEvent);
      case NodeStateName.Enabled:
        // Node is already enabled
        return Promise.resolve(this.get());
      case NodeStateName.Locked:
        return Promise.reject(`Node ${this.aggregateId} cannot be enabled because it is locked`);
      default:
        return Promise.reject(`Node ${this.aggregateId} cannot be enabled because it does not exist`);
    }
  }

  /**
   * Lock a node.
   *
   * Invariants:
   * - State is Enabled|Disabled => emit NodeLocked event
   * - State is Locked => do nothing
   * - State is * => fail "node does not exist"
   *
   * Events:
   * - {@link NodeEventType.NodeLockedV1}
   *
   * @returns A promise that resolves to a node state
   */
  public lock(): Promise<NodeState> {
    switch (this.currentState.name) {
      case NodeStateName.Enabled:
      case NodeStateName.Disabled:
        const nodeEvent: EventInput = {
          aggregateId: this.aggregateId,
          eventType: NodeEventType.LockedV1
        };
        return this.emit(nodeEvent);
      case NodeStateName.Locked:
        // Node is already locked
        return Promise.resolve(this.get());
      default:
        return Promise.reject(`Node ${this.aggregateId} cannot be locked because it does not exist`);
    }
  }

  /**
   * Unlock a node.
   *
   * Invariants:
   * - State is Locked => emit NodeUnlocked event
   * - State is Enabled|Disabled => do nothing
   * - State is * => fail "node does not exist"
   *
   * Events:
   * - {@link NodeEventType.NodeLockedV1}
   *
   * @returns A promise that resolves to a node state
   */
  public unlock(): Promise<NodeState> {
    switch (this.currentState.name) {
      case NodeStateName.Locked:
        const nodeEvent: EventInput = {
          aggregateId: this.aggregateId,
          eventType: NodeEventType.UnlockedV1
        };
        return this.emit(nodeEvent);
      case NodeStateName.Enabled:
      case NodeStateName.Disabled:
        // Node is already unlocked
        return Promise.resolve(this.get());
      default:
        return Promise.reject(`Node ${this.aggregateId} cannot be unlocked because it does not exist`);
    }
  }

  /**
   * Aggregate a snapshot to the current node state.
   *
   * Actions:
   * - Replace current state with snapshotted state
   *
   * @param snapshot Snapshot
   */
  protected aggregateSnapshot(snapshot: Snapshot): void {
    this.currentState = snapshot.payload as NodeState;
  }

  /**
   * Aggregate an event to the current node state.
   *
   * @param event Event
   */
  protected aggregateEvent(event: Event): void {
    switch (event.eventType) {
      case NodeEventType.CreatedV1:
        this.aggregateNodeCreatedV1(event as NodeCreatedV1);
        break;
      case NodeEventType.PropertiesUpdatedV1:
        this.aggregateNodePropertiesUpdatedV1(event as NodePropertiesUpdatedV1);
        break;
      case NodeEventType.EnabledV1:
        this.aggregateNodeEnabledV1(event as NodeEnabledV1);
        break;
      case NodeEventType.DisabledV1:
        this.aggregateNodeDisabledV1(event as NodeDisabledV1);
        break;
      case NodeEventType.LockedV1:
        this.aggregateNodeLockedV1(event as NodeLockedV1);
        break;
      case NodeEventType.UnlockedV1:
        this.aggregateNodeUnlockedV1(event as NodeUnlockedV1);
        break;
      case NodeEventType.DeletedV1:
        this.aggregateNodeDeletedV1(event as NodeDeletedV1);
        break;
      default:
        throw new Error(`Event ${event.eventType} not supported by NodeAggregate.`);
    }
  }

  /**
   * Aggregate a {@link NodeCreatedV1} event to the current node state.
   *
   * Actions:
   * - Create a new node.
   * - Set node state to {@link NodeStateName.Active}.
   *
   * @param event Event
   */
  private aggregateNodeCreatedV1(event: NodeCreatedV1): void {
    // create new node
    const node: Node = {
      nodeId: event.aggregateId,
      ...event.payload
    };

    // update aggregate
    this.currentState = {
      name: NodeStateName.Enabled,
      node
    };
  }

  /**
   * Aggregate {@link NodePropertiesUpdatedV1} event to the current node state.
   *
   * Actions:
   * - Set properties to the existing node.
   *
   * @param event Event
   */
  private aggregateNodePropertiesUpdatedV1(event: NodePropertiesUpdatedV1): void {
    if (!this.currentState.node) {
      throw new Error(
        `State payload is missing in node ${event.aggregateId}. NodePropertiesUpdatedV1 cannot be aggregated.`
      );
    }

    // update node
    const node: Node = {
      ...this.currentState.node,
      ...event.payload
    };

    // update state
    this.currentState = {
      name: NodeStateName.Enabled,
      node
    };
  }

  /**
   * Aggregate {@link NodeEnabledV1} event to the current node state.
   *
   * Actions:
   * - Set node state to {@link NodeStateName.Enabled}.
   *
   * @param event Event
   */
  private aggregateNodeEnabledV1(event: NodeEnabledV1): void {
    if (!this.currentState.node) {
      throw new Error(`State payload is missing in node ${event.aggregateId}. NodeEnabledV1 cannot be aggregated.`);
    }

    // update state
    this.currentState = {
      name: NodeStateName.Enabled,
      node: this.currentState.node
    };
  }

  private aggregateNodeDisabledV1(event: NodeDisabledV1): void {
    if (!this.currentState.node) {
      throw new Error(`State payload is missing in node ${event.aggregateId}. NodeDisabledV1 cannot be aggregated.`);
    }

    // update state
    this.currentState = {
      name: NodeStateName.Disabled,
      node: this.currentState.node
    };
  }

  private aggregateNodeLockedV1(event: NodeLockedV1): void {
    if (!this.currentState.node) {
      throw new Error(`State payload is missing in node ${event.aggregateId}. NodeLockedV1 cannot be aggregated.`);
    }

    // update state
    this.currentState = {
      name: NodeStateName.Locked,
      node: this.currentState.node
    };
  }

  private aggregateNodeUnlockedV1(event: NodeUnlockedV1): void {
    if (!this.currentState.node) {
      throw new Error(`State payload is missing in node ${event.aggregateId}. NodeUnlockedV1 cannot be aggregated.`);
    }

    // update state
    this.currentState = {
      name: NodeStateName.Enabled,
      node: this.currentState.node
    };
  }

  /**
   * Aggregate {@link NodeDeletedV1} event to the current node state.
   *
   * Actions:
   * - Set node state to {@link NodeStateName.Deleted}.
   *
   * @param event Event
   */
  private aggregateNodeDeletedV1(event: NodeDeletedV1): void {
    this.currentState = {
      name: NodeStateName.Deleted
    };
  }
}
