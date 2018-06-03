// eventum dependencies
import { AggregateConfig, Snapshot, AggregateFSM, State, Event } from "eventum-sdk";

// models
import { Nullable } from "../types/Nullable";
import { Mapping, MappingBuilder, MappingProperties } from "../model/Mapping";

// maping events
import { MappingStateName } from "./MappingStateName";
import { MappingEventType } from "../event/MappingEventType";
import { MappingCreatedV1Payload, MappingPropertiesUpdatedV1Payload } from "../event/MappingEventPayload";

export interface IMappingAggregate {
  create(name: string, properties: MappingProperties): Promise<State<Mapping>>;
  setProperties(properties: MappingProperties): Promise<State<Mapping>>;
  delete(): Promise<State<Mapping>>;
}

/**
 * FSM aggregate to handle {@link MappingCommand}.
 */
export class MappingAggregate extends AggregateFSM<Mapping, State<Mapping>> implements IMappingAggregate {
  private currentState: State<Mapping> = {
    stateName: MappingStateName.New
  };

  /**
   * Constructor.
   *
   * @param uuid - Mapping UUID
   * @param config - Aggregate configuration
   */
  protected constructor(uuid: string, config: AggregateConfig) {
    super(uuid, config);
  }

  public static build(uuid: string): Promise<MappingAggregate> {
    const aggregate = new MappingAggregate(uuid, {
      snapshot: {
        delta: 5
      }
    });
    return aggregate.rehydrate().then(() => {
      return aggregate;
    });
  }

  /**
   * Get current mapping.
   */
  public get(): State<Mapping> {
    return this.currentState;
  }

  /**
   * Create a mapping.
   *
   * Invariants:
   * - Mapping must not exist.
   *
   * Events:
   * - MappingCreated
   *
   * @param name Mapping name
   * @param properties Mapping properties
   * @returns A promise with the mapping state
   */
  public create(name: string, properties: MappingProperties): Promise<State<Mapping>> {
    switch (this.currentState.stateName) {
      case MappingStateName.New:
        return this.emit({
          aggregateId: this.aggregateId,
          eventType: MappingEventType.CreatedV1,
          payload: {
            name,
            properties
          }
        });
      default:
        return Promise.reject(`Mapping ${this.aggregateId} already exists.`);
    }
  }

  /**
   * Set mapping properties.
   *
   * Invariants:
   * - Entity must exist and not be deleted.
   *
   * Events:
   * - MappingPropertiesUpdated
   *
   * @param properties Mapping properties
   * @returns A promise with the mapping state
   */
  public setProperties(properties: MappingProperties): Promise<State<Mapping>> {
    switch (this.currentState.stateName) {
      case MappingStateName.Active:
        return this.emit({
          aggregateId: this.aggregateId,
          eventType: MappingEventType.PropertiesUpdatedV1,
          payload: {
            properties
          }
        });
      default:
        return Promise.reject(
          `Cannot set properties on mapping ${this.aggregateId}. It doesn't exist or it's been deleted.`
        );
    }
  }

  /**
   * Delete a mapping.
   *
   * Invariants:
   * - Entity must exist and not be deleted.
   *
   * Events:
   * - MappingDeleted
   *
   * @returns A promise with the mapping state
   */
  public delete(): Promise<State<Mapping>> {
    switch (this.currentState.stateName) {
      case MappingStateName.Active:
        return this.emit({
          aggregateId: this.aggregateId,
          eventType: MappingEventType.DeletedV1
        });
      default:
        return Promise.reject(new Error(`Mapping ${this.aggregateId} doesn't exist and cannot be deleted`));
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
    this.currentState = snapshot.payload as State<Mapping>;
  }

  /**
   * Aggregate {@link Event} to the current state.
   *
   * @param event Event
   */
  protected aggregateEvent(event: Event) {
    switch (event.eventType) {
      case MappingEventType.CreatedV1:
        this.aggregateMappingCreatedV1(event);
        break;
      case MappingEventType.PropertiesUpdatedV1:
        this.aggregateMappingPropertiesUpdatedV1(event);
        break;
      case MappingEventType.DeletedV1:
        this.aggregateMappingDeletedV1(event);
        break;
      default:
        throw new Error(`Event ${event.eventType} not supported by MappingAggregate.`);
    }
  }

  /**
   * Aggregate MappingCreated event to the current state.
   *
   * Actions:
   * - Create a new mapping entity.
   * - Move to state {@link MappingStateName.Active}.
   *
   * @param event Mapping created event V1
   */
  private aggregateMappingCreatedV1(event: Event) {
    const payload = event.payload as MappingCreatedV1Payload;
    const mapping = new MappingBuilder()
      .uuid(event.aggregateId)
      .name(payload.name)
      .properties(payload.properties)
      .build();
    this.currentState = {
      stateName: MappingStateName.Active,
      payload: mapping
    };
  }

  /**
   * Aggregate MappingPropertiesUpdated event to the current state.
   *
   * Actions:
   * - Set properties to the existing mapping.
   *
   * @param event Mapping properties update event V1
   */
  private aggregateMappingPropertiesUpdatedV1(event: Event) {
    const currentMapping = this.currentState.payload;
    const payload = event.payload as MappingPropertiesUpdatedV1Payload;
    const mapping = new MappingBuilder(currentMapping).properties(payload.properties).build();
    this.currentState = {
      stateName: MappingStateName.Active,
      payload: mapping
    };
  }

  /**
   * Aggregate MappingDeleted event to the current state.
   *
   * Actions:
   * - Move to state {@link MappingStateName.Deleted}.
   *
   * @param event Mapping deleted event V1
   */
  private aggregateMappingDeletedV1(event: Event) {
    const mapping = this.currentState.payload;
    this.currentState = {
      stateName: MappingStateName.Deleted
    };
  }
}
