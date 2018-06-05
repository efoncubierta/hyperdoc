// External dependencies
import * as UUID from "uuid";
import { Option } from "fp-ts/lib/Option";

// Hyperdoc models
import { Mappings, Mapping, MappingProperties, MappingId } from "../model/Mapping";

// Hyperdoc aggregates
import { MappingAggregate } from "../aggregate/MappingAggregate";
import { MappingStateName } from "../aggregate/MappingStateName";

// Hyperdoc services
import { ExecutionContext } from "./ExecutionContext";

// Hyperdoc stores
import { StoreFactory } from "../store/StoreFactory";

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
   * @param mappingName Mapping name
   * @param mappingProperties Mapping properties
   *
   * @returns A promise that resolves the mapping just created
   */
  public static create(
    context: ExecutionContext,
    mappingName: string,
    mappingProperties: MappingProperties
  ): Promise<Mapping> {
    // TODO validation
    // TODO check permissions

    //  new mapping UUID
    const mappingId: MappingId = UUID.v1();

    return MappingService.getByName(context, mappingName)
      .then((mappingOpt) => {
        return mappingOpt.foldL(
          () => {
            // get the aggregate for the mapping
            return MappingService.getAggregate(mappingId);
          },
          (mapping) => {
            // throw an error if a mapping with the same name already exists
            throw new Error(`Mapping ${mappingName} already exists`);
          }
        );
      })
      .then((mappingAggregate) => {
        // aggregate checks whether the mapping already exist before creating it
        return mappingAggregate.create(mappingName, mappingProperties);
      })
      .then((mappingState) => {
        // if state is active and has a payload, then return it. Fail otherwise
        if (mappingState.stateName === MappingStateName.Active && mappingState.payload) {
          return mappingState.payload;
        } else {
          throw new Error(`Mapping ${mappingId} is in an inconsistent state`);
        }
      });
  }

  /**
   * Set mapping properties.
   *
   * @param context Execution context
   * @param mappingId Mapping uuid
   * @param mappingProperties Mapping properties
   *
   * @returns A promise that resolves the mapping just updated
   */
  public static setProperties(
    context: ExecutionContext,
    mappingId: MappingId,
    mappingProperties: MappingProperties
  ): Promise<Mapping> {
    // TODO validate
    // TODO check permissions

    // get the mapping aggregate
    return MappingService.getAggregate(mappingId)
      .then((mappingAggregate) => {
        // mapping aggregate checks whether the mapping exist before setting the properties
        return mappingAggregate.setProperties(mappingProperties);
      })
      .then((mappingState) => {
        // if state is active and has a payload, then return it. Fail otherwise
        if (mappingState.stateName === MappingStateName.Active && mappingState.payload) {
          return mappingState.payload;
        } else {
          throw new Error(`Mapping ${mappingId} is in an inconsistent state`);
        }
      });
  }

  private static getAggregate(mappingId: MappingId): Promise<MappingAggregate> {
    return MappingAggregate.build(mappingId);
  }
}
