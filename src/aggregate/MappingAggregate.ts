// Eventum dependencies
import { Aggregate, AggregateConfig, Snapshot, Event } from "eventum-sdk";

// Hyperdoc configuration
import { Hyperdoc } from "../Hyperdoc";

// Hyperdoc models
import { Mapping, MappingProperties, MappingId, MappingStateName, MappingState } from "../model/Mapping";

// Hyperdoc events
import {
  MappingCreatedV1,
  MappingPropertiesUpdatedV1,
  MappingDeletedV1,
  MappingEventType
} from "../event/MappingEvent";

/**
 * Mapping aggregate definition.
 *
 * This aggregate manages mapping states.
 */
export interface IMappingAggregate {
  /**
   * Create a new mapping.
   *
   * @param name Mapping name
   * @param properties Mapping properties
   * @returns Promise that resolves to a mapping state
   */
  create(name: string, properties: MappingProperties): Promise<MappingState>;

  /**
   * Set mapping properties.
   *
   * @param properties Mapping properties
   * @returns Promise that resolves to a mapping state
   */
  setProperties(properties: MappingProperties): Promise<MappingState>;

  /**
   * Delete a mapping
   *
   * @returns Promise that resolves to a mapping state
   */
  delete(): Promise<MappingState>;
}

/**
 * Mapping aggregate.
 */
export class MappingAggregate extends Aggregate<MappingState> implements IMappingAggregate {
  // default current state is New
  private currentState: MappingState = {
    name: MappingStateName.New
  };

  /**
   * Create and rehydrate a mapping aggregate.
   *
   * @param mappingId Mapping ID
   * @returns Promise that resolves to a mapping aggregate
   */
  public static build(mappingId: MappingId): Promise<MappingAggregate> {
    // aggregate config for node aggregate
    const aggregateConfig = Hyperdoc.config().eventum.aggregate.mapping;

    // create aggregate
    const nodeAggregate = new MappingAggregate(mappingId, aggregateConfig);

    return nodeAggregate.rehydrate().then(() => {
      return nodeAggregate;
    });
  }

  /**
   * Get current mapping state.
   */
  public get(): MappingState {
    return this.currentState;
  }

  /**
   * Create a mapping.
   *
   * Invariants:
   * - Mapping state = {@link MappingStateName.New}
   *
   * Events:
   * - {@link MappingEventType.CreatedV1}
   *
   * @param name Mapping name
   * @param properties Mapping properties
   * @returns A promise that resolves to a mapping state
   */
  public create(name: string, properties: MappingProperties): Promise<MappingState> {
    switch (this.currentState.name) {
      case MappingStateName.New:
        const mappingEvent: MappingCreatedV1 = {
          aggregateId: this.aggregateId,
          eventType: MappingEventType.CreatedV1,
          payload: {
            name,
            properties
          }
        };
        return this.emit(mappingEvent);
      default:
        return Promise.reject(`Mapping ${this.aggregateId} already exists.`);
    }
  }

  /**
   * Set mapping properties.
   *
   * Invariants:
   * - Mapping state = {@link MappingStateName.Active}
   *
   * Events:
   * - {@link MappingEventType.PropertiesUpdatedV1}
   *
   * @param properties Mapping properties
   * @returns A promise that resolves to a mapping state
   */
  public setProperties(properties: MappingProperties): Promise<MappingState> {
    switch (this.currentState.name) {
      case MappingStateName.Enabled:
        const mappingEvent: MappingPropertiesUpdatedV1 = {
          aggregateId: this.aggregateId,
          eventType: MappingEventType.PropertiesUpdatedV1,
          payload: {
            properties
          }
        };
        return this.emit(mappingEvent);
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
   * - Mapping state = {@link MappingStateName.Active}
   *
   * Events:
   * - {@link MappingEventType.DeletedV1}
   *
   * @returns A promise that resolves to a mapping state
   */
  public delete(): Promise<MappingState> {
    switch (this.currentState.name) {
      case MappingStateName.Enabled:
        const mappingEvent: MappingDeletedV1 = {
          aggregateId: this.aggregateId,
          eventType: MappingEventType.DeletedV1
        };
        return this.emit(mappingEvent);
      default:
        return Promise.reject(new Error(`Mapping ${this.aggregateId} doesn't exist and cannot be deleted`));
    }
  }

  /**
   * Aggregate a snapshot to the current mapping state.
   *
   * Actions:
   * - Replace current state with snapshotted state
   *
   * @param snapshot Snapshot
   */
  protected aggregateSnapshot(snapshot: Snapshot): void {
    this.currentState = snapshot.payload as MappingState;
  }

  /**
   * Aggregate an event to the current mapping state.
   *
   * @param event Event
   */
  protected aggregateEvent(event: Event): void {
    switch (event.eventType) {
      case MappingEventType.CreatedV1:
        this.aggregateMappingCreatedV1(event as MappingCreatedV1);
        break;
      case MappingEventType.PropertiesUpdatedV1:
        this.aggregateMappingPropertiesUpdatedV1(event as MappingPropertiesUpdatedV1);
        break;
      case MappingEventType.DeletedV1:
        this.aggregateMappingDeletedV1(event as MappingDeletedV1);
        break;
      default:
        throw new Error(`Event ${event.eventType} not supported by MappingAggregate.`);
    }
  }

  /**
   * Aggregate {@link MappingCreatedV1} event to the current mapping state.
   *
   * Actions:
   * - Create a new mapping.
   * - Set mapping state to {@link MappingStateName.Active}.
   *
   * @param event Event
   */
  private aggregateMappingCreatedV1(event: MappingCreatedV1): void {
    const mapping: Mapping = {
      mappingId: event.aggregateId,
      name: event.payload.name,
      properties: event.payload.properties
    };

    this.currentState = {
      name: MappingStateName.Enabled,
      mapping
    };
  }

  /**
   * Aggregate {@link MappingPropertiesUpdatedV1} event to the current mapping state.
   *
   * Actions:
   * - Set properties to the existing mapping.
   *
   * @param event Event
   */
  private aggregateMappingPropertiesUpdatedV1(event: MappingPropertiesUpdatedV1): void {
    const currentMapping = this.currentState.mapping;

    if (!currentMapping) {
      throw new Error(
        `State payload is missing in node ${event.aggregateId}. MappingPropertiesUpdatedV1 cannot be aggregated.`
      );
    }

    const mapping: Mapping = {
      ...currentMapping,
      properties: event.payload.properties
    };

    this.currentState = {
      name: MappingStateName.Enabled,
      mapping
    };
  }

  /**
   * Aggregate {@link MappingDeletedV1} event to the current mapping state.
   *
   * Actions:
   * - Set mapping state to {@link MappingStateName.Deleted}.
   *
   * @param event Event
   */
  private aggregateMappingDeletedV1(event: MappingDeletedV1): void {
    this.currentState = {
      name: MappingStateName.Deleted
    };
  }
}
