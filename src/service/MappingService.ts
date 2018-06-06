// External dependencies
import * as UUID from "uuid";
import { Option } from "fp-ts/lib/Option";

// Hyperdoc models
import { Mappings, Mapping, MappingProperties, MappingId, MappingStateName, MappingState } from "../model/Mapping";

// Hyperdoc aggregates
import { MappingAggregate, IMappingAggregate } from "../aggregate/MappingAggregate";

// Hyperdoc services
import { ExecutionContext } from "./ExecutionContext";

// Hyperdoc stores
import { StoreFactory } from "../store/StoreFactory";
import { MappingServiceError } from "./MappingServiceError";
import { SchemaValidator } from "../validation/SchemaValidator";

/**
 * Service to manage mappings from the user space.
 */
export class MappingService {
  /**
   * Get all mappings.
   *
   * @param context Execution context
   *
   * @returns A promise that contains a mappings dictionary
   */
  public static list(context: ExecutionContext): Promise<Mappings> {
    return StoreFactory.getMappingStore()
      .list()
      .then((mappingArray) => {
        const mappings: Mappings = {};
        mappingArray.forEach((mapping) => {
          mappings[mapping.name] = mapping;
        });

        return mappings;
      });
  }

  /**
   * Get a mapping.
   *
   * @param context Execution context
   * @param mappingId Mapping uuid
   *
   * @returns A promise that resolve to an optional mapping
   */
  public static get(context: ExecutionContext, mappingId: MappingId): Promise<Option<Mapping>> {
    return StoreFactory.getMappingStore().get(mappingId);
  }

  /**
   * Get a mapping by its name.
   *
   * @param context Execution context
   * @param mappingName Mapping name
   *
   * @returns A promise that resolve to an optional mapping
   */
  public static getByName(context: ExecutionContext, mappingName: string): Promise<Option<Mapping>> {
    return StoreFactory.getMappingStore().getByName(mappingName);
  }

  /**
   * Create a new mapping.
   *
   * @param context Execution context
   * @param name Mapping name
   * @param properties Mapping properties
   *
   * @returns A promise that resolves the mapping just created
   */
  public static create(context: ExecutionContext, name: string, properties: MappingProperties): Promise<Mapping> {
    // TODO check permissions

    // validation
    MappingService.validateMappingName(name);
    MappingService.validateMappingProperties(properties);

    //  new mapping UUID
    const mappingId: MappingId = UUID.v1();

    return MappingService.getByName(context, name).then((mappingOpt) => {
      return mappingOpt.foldL(
        () => {
          // invoke create() in the aggregate. New state must be "Enabled"
          return this.runAggregate(mappingId)((aggregate) => aggregate.create(name, properties), [
            MappingStateName.Enabled
          ]);
        },
        (mapping) => {
          // throw an error if a mapping with the same name already exists
          throw new MappingServiceError(`Mapping ${name} already exists`);
        }
      );
    });
  }

  /**
   * Set mapping properties.
   *
   * @param context Execution context
   * @param mappingId Mapping uuid
   * @param properties Mapping properties
   *
   * @returns A promise that resolves the mapping just updated
   */
  public static setProperties(
    context: ExecutionContext,
    mappingId: MappingId,
    properties: MappingProperties
  ): Promise<Mapping> {
    // TODO check permissions

    // validation
    MappingService.validateMappingProperties(properties);

    // invoke setProperties() in the aggregate. New state must be "Enabled"
    return this.runAggregate(mappingId)((aggregate) => aggregate.setProperties(properties), [MappingStateName.Enabled]);
  }

  private static runAggregate(mappingId: MappingId): RunAggregateF {
    return (invoke: AggregateInvokeF, expectedStates: MappingStateName[], hasPayload: boolean = true) => {
      return this.getAggregate(mappingId)
        .then((aggregate) => {
          return invoke(aggregate);
        })
        .then((mappingState) => {
          if (expectedStates.indexOf(mappingState.name) >= 0 && (!hasPayload || mappingState.mapping)) {
            return mappingState.mapping;
          } else {
            throw new MappingServiceError(`Mapping ${mappingId} is in an inconsistent state`);
          }
        });
    };
  }

  private static getAggregate(mappingId: MappingId): Promise<IMappingAggregate> {
    return MappingAggregate.build(mappingId);
  }

  private static validateMappingName(name: string): void {
    // validate mapping name against the JSON schema and process errors
    const result = SchemaValidator.validateMappingName(name);
    if (result.errors.length > 0) {
      throw new MappingServiceError(result.errors[0].message);
    }
  }

  private static validateMappingProperties(properties: MappingProperties): void {
    // validate mapping properties against the JSON schema and process errors
    const result = SchemaValidator.validateMappingProperties(properties);
    if (result.errors.length > 0) {
      throw new MappingServiceError(result.errors[0].message);
    }
  }
}

type AggregateInvokeF = (aggregate: IMappingAggregate) => Promise<MappingState>;
type RunAggregateF = (
  invoke: AggregateInvokeF,
  expectedStates: MappingStateName[],
  hasPayload?: boolean
) => Promise<Mapping>;
