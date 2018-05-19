import { Aggregate, AggregateConfig, New, Active, Deleted, Snapshot } from "hyperdoc-eventstore";
import { Node, NodeBuilder } from "hyperdoc-core";
import { GetNode } from "../message/command/GetNode";
import { CreateNode } from "../message/command/CreateNode";
import { DeleteNode } from "../message/command/DeleteNode";
import { SetNodeProperties } from "../message/command/SetNodeProperties";
import { NodeCreatedV1 } from "../message/event/NodeCreatedV1";
import { NodeDeletedV1 } from "../message/event/NodeDeletedV1";
import { NodePropertiesUpdatedV1 } from "../message/event/NodePropertiesUpdatedV1";

export type NodeCommand = GetNode | CreateNode | DeleteNode | SetNodeProperties;
export type NodeEvent = NodeCreatedV1 | NodeDeletedV1 | NodePropertiesUpdatedV1;
export type NodeState = New<Node> | Active<Node> | Deleted<Node>;

/**
 * Aggregate for {@link Node} entities.
 */
export class NodeAggregate extends Aggregate<Node, NodeState, NodeCommand, NodeEvent> {
  private readonly uuid: string;
  private state: NodeState = new New();

  /**
   * Constructor.
   *
   * @param uuid - Node UUID
   * @param config - Aggregate configuration
   */
  constructor(uuid: string, config: AggregateConfig) {
    super(uuid, config);
  }

  /**
   * Handle a {@link NodeCommand}.
   *
   * @param command Node command
   * @returns A promise with the state after running the command
   */
  public handle(command: NodeCommand): Promise<NodeState> {
    switch (command.$command) {
      case GetNode.NAME:
        return this.handleGetNode(command as GetNode);
      case CreateNode.NAME:
        return this.handleCreateNode(command as CreateNode);
      case SetNodeProperties.NAME:
        return this.handleSetNodeProperties(command as SetNodeProperties);
      case DeleteNode.NAME:
        return this.handleDeleteNode(command as DeleteNode);
      default:
        return Promise.reject(`Command ${command.$command} not supported by NodeAggregate.`);
    }
  }

  /**
   * Get current state.
   */
  protected currentState(): NodeState {
    return this.state;
  }

  /**
   * Handle a {@link GetNode} command.
   *
   * @param command Create node command
   * @returns A promise with the state after running the command
   */
  private handleGetNode(command: GetNode): Promise<NodeState> {
    return Promise.resolve(this.currentState());
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
    switch (this.state.$state) {
      case New.NAME:
        return this.save(
          new NodeCreatedV1(this.aggregateId, this.getNextSequence(), command.mappingName, command.properties)
        ).then((event) => {
          this.aggregateEvent(event);
          return this.currentState();
        });
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
    switch (this.state.$state) {
      case Active.NAME:
        return this.save(
          new NodePropertiesUpdatedV1(this.aggregateId, this.getNextSequence(), command.properties)
        ).then((event) => {
          this.aggregateEvent(event);
          return this.currentState();
        });
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
    switch (this.state.$state) {
      case Active.NAME:
        return this.save(new NodeDeletedV1(this.aggregateId, this.getNextSequence())).then((event) => {
          this.aggregateEvent(event);
          return this.currentState();
        });
      default:
      // idempotent action
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
  protected aggregateSnapshot(snapshot: Snapshot) {
    this.state = snapshot.state;
  }

  /**
   * Aggregate {@link NodeEvent} to the current state.
   *
   * @param event Node event
   */
  protected aggregateEvent(event: NodeEvent) {
    switch (event.$event) {
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
      // TODO handle error
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
      .uuid(event.$aggregateId)
      .mapping(event.mappingName)
      .properties(event.properties)
      .build();
    this.state = new Active(node);
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
    const currentNode = (this.state as Active<Node>).data;
    const node = new NodeBuilder(currentNode).properties(event.properties).build();
    this.state = new Active(node);
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
    const node = (this.state as Active<Node>).data;
    this.state = new Deleted(node);
  }
}
