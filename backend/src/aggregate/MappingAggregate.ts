import { Aggregate, AggregateConfig, New, Active, Deleted, Snapshot } from "hyperdoc-eventstore";
import { Mapping, MappingBuilder } from "hyperdoc-core";
import { GetMapping } from "../message/command/GetMapping";
import { CreateMapping } from "../message/command/CreateMapping";
import { SetMappingProperties } from "../message/command/SetMappingProperties";
import { DeleteMapping } from "../message/command/DeleteMapping";
import { MappingPropertiesUpdatedV1 } from "../message/event/MappingPropertiesUpdatedV1";
import { MappingDeletedV1 } from "../message/event/MappingDeletedV1";
import { MappingCreatedV1 } from "../message/event/MappingCreatedV1";

export type MappingCommand = GetMapping | CreateMapping | DeleteMapping | SetMappingProperties;
export type MappingEvent = MappingCreatedV1 | MappingDeletedV1 | MappingPropertiesUpdatedV1;
export type MappingState = New<Mapping> | Active<Mapping> | Deleted<Mapping>;

/**
 * Aggregate for {@link Mapping} entities.
 */
export class MappingAggregate extends Aggregate<Mapping, MappingState, MappingCommand, MappingEvent> {
  private readonly uuid: string;
  private state: MappingState = new New();

  /**
   * Constructor.
   *
   * @param uuid - Mapping UUID
   * @param config - Aggregate configuration
   */
  constructor(uuid: string, config: AggregateConfig) {
    super(uuid, config);
  }

  /**
   * Handle a {@link MappingCommand}.
   *
   * @param command Mapping command
   * @returns A promise with the state after running the command
   */
  public handle(command: MappingCommand): Promise<MappingState> {
    switch (command.$command) {
      case GetMapping.NAME:
        return this.handleGetMapping(command as GetMapping);
      case CreateMapping.NAME:
        return this.handleCreateMapping(command as CreateMapping);
      case SetMappingProperties.NAME:
        return this.handleSetMappingProperties(command as SetMappingProperties);
      case DeleteMapping.NAME:
        return this.handleDeleteMapping(command as DeleteMapping);
      default:
        return Promise.reject(`Command ${command.$command} not supported by MappingAggregate.`);
    }
  }

  /**
   * Get current state.
   */
  protected currentState(): MappingState {
    return this.state;
  }

  /**
   * Handle a {@link GetMapping} command.
   *
   * @param command Create mapping command
   * @returns A promise with the state after running the command
   */
  private handleGetMapping(command: GetMapping): Promise<MappingState> {
    return Promise.resolve(this.currentState());
  }

  /**
   * Handle a {@link CreateMapping} command.
   *
   * Invariants:
   * - Entity must not exist (state = {@link NewMapping})
   *
   * Events:
   * - {@link MappingCreatedV1}
   *
   * @param command Create mapping command
   * @returns A promise with the state after running the command
   */
  private handleCreateMapping(command: CreateMapping): Promise<MappingState> {
    switch (this.state.$state) {
      case New.NAME:
        return this.save(
          new MappingCreatedV1(this.aggregateId, this.getNextSequence(), command.name, command.properties)
        ).then((event) => {
          this.aggregateEvent(event);
          return this.currentState();
        });
      default:
        return Promise.reject(`Mapping ${this.aggregateId} already exists.`);
    }
  }

  /**
   * Handle a {@link SetMappingProperties} command.
   *
   * Invariants:
   * - Entity must exist and not be deleted (state = {@link Active})
   *
   * Events:
   * - {@link MappingPropertiesUpdatedV1}
   *
   * @param command Set mapping properties command
   * @returns A promise with the state after running the command
   */
  private handleSetMappingProperties(command: SetMappingProperties): Promise<MappingState> {
    switch (this.state.$state) {
      case Active.NAME:
        return this.save(
          new MappingPropertiesUpdatedV1(this.aggregateId, this.getNextSequence(), command.properties)
        ).then((event) => {
          this.aggregateEvent(event);
          return this.currentState();
        });
      default:
        return Promise.reject(
          `Cannot set properties on mapping ${this.aggregateId}. It doesn't exist or it's been deleted.`
        );
    }
  }

  /**
   * Handle a {@link DeleteMapping} command.
   *
   * Invariants:
   * - Entity must exist and not be deleted (state = {@link Active}).
   * - If the entity does not exist or it is already deleted, this command has no effect on the state.
   *
   * Events:
   * - {@link MappingDeletedV1}
   *
   * @param command Delete mapping property
   * @returns A promise with the state after running the command
   */
  private handleDeleteMapping(command: DeleteMapping): Promise<MappingState> {
    switch (this.state.$state) {
      case Active.NAME:
        return this.save(new MappingDeletedV1(this.aggregateId, this.getNextSequence())).then((event) => {
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
   * @param snapshot Mapping state snapshot
   */
  protected aggregateSnapshot(snapshot: Snapshot) {
    this.state = snapshot.state;
  }

  /**
   * Aggregate {@link MappingEvent} to the current state.
   *
   * @param event Mapping event
   */
  protected aggregateEvent(event: MappingEvent) {
    switch (event.$event) {
      case MappingCreatedV1.NAME:
        this.aggregateMappingCreatedV1(event as MappingCreatedV1);
        break;
      case MappingPropertiesUpdatedV1.NAME:
        this.aggregateMappingPropertiesUpdatedV1(event as MappingPropertiesUpdatedV1);
        break;
      case MappingDeletedV1.NAME:
        this.aggregateMappingDeletedV1(event as MappingDeletedV1);
        break;
      default:
      // TODO handle error
    }
  }

  /**
   * Aggregate {@link MappingCreatedV1} to the current state.
   *
   * Actions:
   * - Create a new mapping entity.
   * - Move to state {@link Active}.
   *
   * @param event Mapping created event V1
   */
  private aggregateMappingCreatedV1(event: MappingCreatedV1) {
    const mapping = new MappingBuilder()
      .uuid(event.$aggregateId)
      .name(event.name)
      .properties(event.properties)
      .build();
    this.state = new Active(mapping);
  }

  /**
   * Aggregate {@link MappingPropertiesUpdatedV1} to the current state.
   *
   * Actions:
   * - Set properties to the existing mapping.
   *
   * @param event Mapping properties update event V1
   */
  private aggregateMappingPropertiesUpdatedV1(event: MappingPropertiesUpdatedV1) {
    const currentMapping = (this.state as Active<Mapping>).data;
    const mapping = new MappingBuilder(currentMapping).properties(event.properties).build();
    this.state = new Active(mapping);
  }

  /**
   * Aggregate {@link MappingDeletedV1} to the current state.
   *
   * Actions:
   * - Move entity to state {@link Deleted}.
   *
   * @param event Mapping deleted event V1
   */
  private aggregateMappingDeletedV1(event: MappingDeletedV1) {
    const mapping = (this.state as Active<Mapping>).data;
    this.state = new Deleted(mapping);
  }
}
