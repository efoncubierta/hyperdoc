// eventum dependencies
import { AggregateConfig, New, Active, Deleted, Snapshot, AggregateFSM } from "eventum-sdk";

// models
import { Node, NodeBuilder } from "../model/Node";

// node commands
import { GetNode } from "../message/command/GetNode";
import { CreateNode } from "../message/command/CreateNode";
import { SetNodeProperties } from "../message/command/SetNodeProperties";
import { DeleteNode } from "../message/command/DeleteNode";

// node events
import { NodeCreatedV1 } from "../message/event/NodeCreatedV1";
import { NodePropertiesUpdatedV1 } from "../message/event/NodePropertiesUpdatedV1";
import { NodeDeletedV1 } from "../message/event/NodeDeletedV1";

export type NodeCommand = GetNode | CreateNode | DeleteNode | SetNodeProperties;
export type NodeEvent = NodeCreatedV1 | NodeDeletedV1 | NodePropertiesUpdatedV1;
export type NodeState = New<Node> | Active<Node> | Deleted<Node>;

/**
 * Aggregate for {@link Node} entities.
 */
export class NodeAggregate extends AggregateFSM<Node, NodeState, NodeCommand, NodeEvent> {
  private readonly uuid: string;
  private currentState: NodeState = new New();

  /**
   * Constructor.
   *
   * @param uuid - Node UUID
   * @param config - Aggregate configuration
   */
  protected constructor(uuid: string, config: AggregateConfig) {
    super(uuid, config);
  }

  public static build(uuid: string): Promise<NodeAggregate> {
    const aggregate = new NodeAggregate(uuid, {
      snapshot: {
        delta: 5
      }
    });
    return aggregate.rehydrate().then(() => {
      return aggregate;
    });
  }

  /**
   * Handle a {@link NodeCommand}.
   *
   * @param command Node command
   * @returns A promise with the state after running the command
   */
  public handle(command: NodeCommand): Promise<NodeState> {
    switch (command.commandType) {
      case GetNode.NAME:
        return this.handleGetNode(command as GetNode);
      case CreateNode.NAME:
        return this.handleCreateNode(command as CreateNode);
      case SetNodeProperties.NAME:
        return this.handleSetNodeProperties(command as SetNodeProperties);
      case DeleteNode.NAME:
        return this.handleDeleteNode(command as DeleteNode);
      default:
        return Promise.reject(`Command ${command.commandType} not supported by NodeAggregate.`);
    }
  }

  /**
   * Get current state.
   */
  protected getEntity(): NodeState {
    return this.currentState;
  }

  /**
   * Handle a {@link GetNode} command.
   *
   * @param command Create node command
   * @returns A promise with the state after running the command
   */
  private handleGetNode(command: GetNode): Promise<NodeState> {
    return Promise.resolve(this.getEntity());
  }

  /**
   * Handle a {@link CreateNode} command.
   *
   * Invariants:
   * - Entity must not exist (state = {@link NewNode})
   *
   * Events:
   * - {@link NodeCreatedV1}
   *
   * @param command Create node command
   * @returns A promise with the state after running the command
   */
  private handleCreateNode(command: CreateNode): Promise<NodeState> {
    switch (this.currentState.stateName) {
      case New.STATE_NAME:
        const event = new NodeCreatedV1(this.aggregateId, this.getNextSequence(), {
          mappingName: command.mappingName,
          properties: command.properties
        });
        return this.save(event);
      default:
        return Promise.reject(`Node ${this.aggregateId} already exists.`);
    }
  }

  /**
   * Handle a {@link SetNodeProperties} command.
   *
   * Invariants:
   * - Entity must exist and not be deleted (state = {@link Active})
   *
   * Events:
   * - {@link NodePropertiesUpdatedV1}
   *
   * @param command Set node properties command
   * @returns A promise with the state after running the command
   */
  private handleSetNodeProperties(command: SetNodeProperties): Promise<NodeState> {
    switch (this.currentState.stateName) {
      case Active.STATE_NAME:
        const event = new NodePropertiesUpdatedV1(this.aggregateId, this.getNextSequence(), {
          properties: command.properties
        });
        return this.save(event);
      default:
        return Promise.reject(
          `Cannot set properties on node ${this.aggregateId}. It doesn't exist or it's been deleted.`
        );
    }
  }

  /**
   * Handle a {@link DeleteNode} command.
   *
   * Invariants:
   * - Entity must exist and not be deleted (state = {@link Active}).
   * - If the entity does not exist or it is already deleted, this command has no effect on the state.
   *
   * Events:
   * - {@link NodeDeletedV1}
   *
   * @param command Delete node property
   * @returns A promise with the state after running the command
   */
  private handleDeleteNode(command: DeleteNode): Promise<NodeState> {
    switch (this.currentState.stateName) {
      case Active.STATE_NAME:
        const event = new NodeDeletedV1(this.aggregateId, this.getNextSequence());

        return this.save(event);
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
   * @param snapshot Node state snapshot
   */
  protected aggregateSnapshot(snapshot: Snapshot<NodeState>) {
    this.currentState = snapshot.payload;
  }

  /**
   * Aggregate {@link NodeEvent} to the current state.
   *
   * @param event Node event
   */
  protected aggregateEvent(event: NodeEvent) {
    switch (event.eventType) {
      case NodeCreatedV1.NAME:
        this.aggregateNodeCreatedV1(event as NodeCreatedV1);
        break;
      case NodePropertiesUpdatedV1.NAME:
        this.aggregateNodePropertiesUpdatedV1(event as NodePropertiesUpdatedV1);
        break;
      case NodeDeletedV1.NAME:
        this.aggregateNodeDeletedV1(event as NodeDeletedV1);
        break;
      default:
        return Promise.reject(new Error(`Event ${event.eventType} not supported by NodeAggregate.`));
    }
  }

  /**
   * Aggregate {@link NodeCreatedV1} to the current state.
   *
   * Actions:
   * - Create a new node entity.
   * - Move to state {@link Active}.
   *
   * @param event Node created event V1
   */
  private aggregateNodeCreatedV1(event: NodeCreatedV1) {
    const node = new NodeBuilder()
      .uuid(event.aggregateId)
      .mapping(event.payload.mappingName)
      .properties(event.payload.properties)
      .build();
    this.currentState = new Active(node);
  }

  /**
   * Aggregate {@link NodePropertiesUpdatedV1} to the current state.
   *
   * Actions:
   * - Set properties to the existing node.
   *
   * @param event Node properties update event V1
   */
  private aggregateNodePropertiesUpdatedV1(event: NodePropertiesUpdatedV1) {
    const currentNode = (this.currentState as Active<Node>).payload;
    const node = new NodeBuilder(currentNode).properties(event.payload.properties).build();
    this.currentState = new Active(node);
  }

  /**
   * Aggregate {@link NodeDeletedV1} to the current state.
   *
   * Actions:
   * - Move entity to state {@link Deleted}.
   *
   * @param event Node deleted event V1
   */
  private aggregateNodeDeletedV1(event: NodeDeletedV1) {
    const node = (this.currentState as Active<Node>).payload;
    this.currentState = new Deleted(node);
  }
}
