// Eventum dependencies
import { Aggregate, Snapshot, Event, EventInput, AggregateConfig } from "eventum-sdk";

// Hyperdoc configuration
import { Hyperdoc } from "../Hyperdoc";

// Hyperdoc models
import {
  Mapping,
  MappingProperties,
  MappingId,
  MappingStateName,
  MappingState,
  MappingStrictnessLevel
} from "../model/Mapping";

// Hyperdoc events
import {
  MappingCreatedV1,
  MappingPropertiesUpdatedV1,
  MappingDeletedV1,
  MappingEventType,
  MappingCreatedV1Payload,
  MappingPropertiesUpdatedV1Payload,
  MappingStrictnessChangedV1Payload
} from "../event/MappingEvent";
import { ExecutionContext } from "../ExecutionContext";

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
   * @param strictness Mapping type
   * @param properties Mapping properties
   * @returns Promise that resolves to a mapping state
   */
  create(name: string, strictness: MappingStrictnessLevel, properties: MappingProperties): Promise<MappingState>;

  /**
   * Set mapping properties.
   *
   * @param properties Mapping properties
   * @returns Promise that resolves to a mapping state
   */
  setProperties(properties: MappingProperties): Promise<MappingState>;

  /**
   * Change mapping strictness level.
   *
   * @param strictness Mapping strictness level
   * @returns Promise that resolves to a mapping state
   */
  changeStrictness(strictness: MappingStrictnessLevel): Promise<MappingState>;

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

  // Hyperdoc execution context
  private readonly context: ExecutionContext;

  protected constructor(context: ExecutionContext, mappingId: MappingId, config: AggregateConfig) {
    super(mappingId, config);
    this.context = context;
  }

  /**
   * Create and rehydrate a mapping aggregate.
   *
   * @param context Hyperdoc execution context
   * @param mappingId Mapping ID
   * @returns Promise that resolves to a mapping aggregate
   */
  public static build(context: ExecutionContext, mappingId: MappingId): Promise<MappingAggregate> {
    // aggregate config for node aggregate
    const aggregateConfig = Hyperdoc.config().eventum.aggregate.mapping;

    // create aggregate
    const nodeAggregate = new MappingAggregate(context, mappingId, aggregateConfig);

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
   * @param strictness Mapping strictness
   * @param properties Mapping properties
   * @returns A promise that resolves to a mapping state
   */
  public create(
    name: string,
    strictness: MappingStrictnessLevel,
    properties: MappingProperties
  ): Promise<MappingState> {
    switch (this.currentState.name) {
      case MappingStateName.New:
        const mappingEventPayload: MappingCreatedV1Payload = {
          name,
          strictness,
          properties
        };
        const mappingEvent: EventInput = {
          source: Hyperdoc.config().serviceName,
          authority: this.context.auth.userHrn,
          aggregateId: this.aggregateId,
          eventType: MappingEventType.CreatedV1,
          payload: mappingEventPayload
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
   * - Mapping state = {@link MappingStateName.Enabled}
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
        const mappingEventPayload: MappingPropertiesUpdatedV1Payload = {
          properties
        };
        const mappingEvent: EventInput = {
          source: Hyperdoc.config().serviceName,
          authority: this.context.auth.userHrn,
          aggregateId: this.aggregateId,
          eventType: MappingEventType.PropertiesUpdatedV1,
          payload: mappingEventPayload
        };
        return this.emit(mappingEvent);
      default:
        return Promise.reject(
          `Cannot set properties on mapping ${this.aggregateId}. It doesn't exist or it's been deleted.`
        );
    }
  }

  /**
   * Change mapping strictness level.
   *
   * Invariants:
   * - Mapping state = {@link MappingStateName.Enabled}
   *
   * Events:
   * - {@link MappingEventType.TypeChangedV1}
   *
   * @param strictness Mapping type
   * @returns A promise that resolves to a mapping state
   */
  changeStrictness(strictness: MappingStrictnessLevel): Promise<MappingState> {
    switch (this.currentState.name) {
      case MappingStateName.Enabled:
        const mappingEventPayload: MappingStrictnessChangedV1Payload = {
          strictness
        };
        const mappingEvent: EventInput = {
          source: Hyperdoc.config().serviceName,
          authority: this.context.auth.userHrn,
          aggregateId: this.aggregateId,
          eventType: MappingEventType.StrictnessChangedV1,
          payload: mappingEventPayload
        };
        return this.emit(mappingEvent);
      default:
        return Promise.reject(
          `Cannot change type on mapping ${this.aggregateId}. It doesn't exist or it's been deleted.`
        );
    }
  }

  /**
   * Delete a mapping.
   *
   * Invariants:
   * - Mapping state = {@link MappingStateName.Enabled}
   *
   * Events:
   * - {@link MappingEventType.DeletedV1}
   *
   * @returns A promise that resolves to a mapping state
   */
  public delete(): Promise<MappingState> {
    switch (this.currentState.name) {
      case MappingStateName.Enabled:
        const mappingEvent: EventInput = {
          source: Hyperdoc.config().serviceName,
          authority: this.context.auth.userHrn,
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
      strictness: event.payload.strictness,
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
