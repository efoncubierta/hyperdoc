// Eventum dependencies
import { Aggregate, AggregateConfig, Snapshot, State, Event } from "eventum-sdk";

// Hyperdoc models
import { Node, NodeProperties, NodeId } from "../model/Node";

// Hyperdoc events
import { NodeStateName } from "./NodeStateName";
import { NodeEventType } from "../event/NodeEventType";
import { NodeCreatedV1Payload, NodePropertiesUpdatedV1Payload } from "../event/NodeEventPayload";

export interface INodeAggregate {
  create(name: string, properties: NodeProperties): Promise<State<Node>>;
  setProperties(properties: NodeProperties): Promise<State<Node>>;
  delete(): Promise<State<Node>>;
}

/**
 * FSM aggregate to handle {@link NodeCommand}.
 */
export class NodeAggregate extends Aggregate<State<Node>> implements INodeAggregate {
  private currentState: State<Node> = {
    stateName: NodeStateName.New
  };

  /**
   * Constructor.
   *
   * @param nodeId Node ID
   * @param config Aggregate configuration
   */
  protected constructor(nodeId: NodeId, config: AggregateConfig) {
    super(nodeId, config);
  }

  public static build(nodeId: NodeId): Promise<NodeAggregate> {
    const aggregate = new NodeAggregate(nodeId, {
      snapshot: {
        delta: 5
      }
    });
    return aggregate.rehydrate().then(() => {
      return aggregate;
    });
  }

  /**
   * Get current node.
   */
  public get(): State<Node> {
    return this.currentState;
  }

  /**
   * Create a node.
   *
   * Invariants:
   * - Node must not exist.
   *
   * Events:
   * - NodeCreated
   *
   * @param name Node name
   * @param properties Node properties
   * @returns A promise with the node state
   */
  public create(name: string, properties: NodeProperties): Promise<State<Node>> {
    switch (this.currentState.stateName) {
      case NodeStateName.New:
        return this.emit({
          aggregateId: this.aggregateId,
          eventType: NodeEventType.CreatedV1,
          payload: {
            name,
            properties
          }
        });
      default:
        return Promise.reject(`Node ${this.aggregateId} already exists.`);
    }
  }

  /**
   * Set node properties.
   *
   * Invariants:
   * - Entity must exist and not be deleted.
   *
   * Events:
   * - NodePropertiesUpdated
   *
   * @param properties Node properties
   * @returns A promise with the node state
   */
  public setProperties(properties: NodeProperties): Promise<State<Node>> {
    switch (this.currentState.stateName) {
      case NodeStateName.Active:
        return this.emit({
          aggregateId: this.aggregateId,
          eventType: NodeEventType.PropertiesUpdatedV1,
          payload: {
            properties
          }
        });
      default:
        return Promise.reject(
          `Cannot set properties on node ${this.aggregateId}. It doesn't exist or it's been deleted.`
        );
    }
  }

  /**
   * Delete a node.
   *
   * Invariants:
   * - Entity must exist and not be deleted.
   *
   * Events:
   * - NodeDeleted
   *
   * @returns A promise with the node state
   */
  public delete(): Promise<State<Node>> {
    switch (this.currentState.stateName) {
      case NodeStateName.Active:
        return this.emit({
          aggregateId: this.aggregateId,
          eventType: NodeEventType.DeletedV1
        });
      default:
        return Promise.reject(new Error(`Node ${this.aggregateId} doesn't exist and cannot be deleted`));
    }
  }

  /**
   * Aggregate {@link Snapshot} to the current state.
   *
   * Actions:
   * - Replace current state with snapshotted state
   *
   * @param snapshot Snapshot
   */
  protected aggregateSnapshot(snapshot: Snapshot) {
    this.currentState = snapshot.payload as State<Node>;
  }

  /**
   * Aggregate {@link Event} to the current state.
   *
   * @param event Event
   */
  protected aggregateEvent(event: Event) {
    switch (event.eventType) {
      case NodeEventType.CreatedV1:
        this.aggregateNodeCreatedV1(event);
        break;
      case NodeEventType.PropertiesUpdatedV1:
        this.aggregateNodePropertiesUpdatedV1(event);
        break;
      case NodeEventType.DeletedV1:
        this.aggregateNodeDeletedV1(event);
        break;
      default:
        throw new Error(`Event ${event.eventType} not supported by NodeAggregate.`);
    }
  }

  /**
   * Aggregate NodeCreated event to the current state.
   *
   * Actions:
   * - Create a new node entity.
   * - Move to state {@link NodeStateName.Active}.
   *
   * @param event Node created event V1
   */
  private aggregateNodeCreatedV1(event: Event) {
    const payload = event.payload as NodeCreatedV1Payload;

    const node: Node = {
      uuid: event.aggregateId,
      mappingName: payload.mappingName,
      properties: payload.properties
    };

    this.currentState = {
      stateName: NodeStateName.Active,
      payload: node
    };
  }

  /**
   * Aggregate NodePropertiesUpdated event to the current state.
   *
   * Actions:
   * - Set properties to the existing node.
   *
   * @param event Node properties update event V1
   */
  private aggregateNodePropertiesUpdatedV1(event: Event) {
    const currentNode = this.currentState.payload;
    const payload = event.payload as NodePropertiesUpdatedV1Payload;

    const node: Node = {
      ...currentNode,
      properties: payload.properties
    };

    this.currentState = {
      stateName: NodeStateName.Active,
      payload: node
    };
  }

  /**
   * Aggregate NodeDeleted event to the current state.
   *
   * Actions:
   * - Move to state {@link NodeStateName.Deleted}.
   *
   * @param event Node deleted event V1
   */
  private aggregateNodeDeletedV1(event: Event) {
    const node = this.currentState.payload;
    this.currentState = {
      stateName: NodeStateName.Deleted
    };
  }
}
