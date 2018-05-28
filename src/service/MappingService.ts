// external dependencies
import * as UUID from "uuid";
import { Active } from "eventum-sdk";

// models
import { Mappings, Mapping, MappingProperties } from "../model/Mapping";

// aggregates
import { MappingAggregate } from "../aggregate/MappingAggregate";

// stores
import { StoreFactory } from "../store/StoreFactory";

// mapping messages
import { SetMappingProperties } from "../message/command/SetMappingProperties";
import { GetMapping } from "../message/command/GetMapping";
import { CreateMapping } from "../message/command/CreateMapping";

import { ExecutionContext } from "./ExecutionContext";

/**
 * Service to manage mappings from the user space.
 */
export class MappingService {
  /**
   * Get all mappings.
   *
   * @param {ExecutionContext} context - Execution context
   * @returns {Promise<Mappings>} A promise that contains a mappings dictionary
   */
  public static list(context: ExecutionContext): Promise<Mappings> {
    return StoreFactory.getMappingStore()
      .list()
      .then((mappings) => {
        const ms: Mappings = {};
        mappings.forEach((mapping) => {
          ms[mapping.name] = mapping;
        });

        return ms;
      });
  }

  /**
   * Get a mapping.
   *
   * @param {ExecutionContext} context - Execution context
   * @param {string} uuid - Mapping uuid
   * @returns {Promise<Mapping>} A promise that contains the mapping, or null if missing
   */
  public static get(context: ExecutionContext, uuid: string): Promise<Mapping> {
    return StoreFactory.getMappingStore().get(uuid);
  }

  /**
   * Get a mapping by its name.
   *
   * @param {ExecutionContext} context - Execution context
   * @param {string} name - Mapping name
   * @returns {Promise<Mapping>} A promise that contains the mapping, or null if missing
   */
  public static getByName(context: ExecutionContext, name: string): Promise<Mapping> {
    return StoreFactory.getMappingStore().getByName(name);
  }

  /**
   * Create a new mapping.
   *
   * @param {ExecutionContext} context - Execution context
   * @param {string} name - Mapping name
   * @param {MappingProperties} properties - Mapping properties
   * @returns {Promise<Mapping>} A promise that contains the mapping just created
   */
  public static create(context: ExecutionContext, name: string, properties: MappingProperties): Promise<Mapping> {
    // TODO validation
    // TODO check permissions

    //  new mapping UUID
    const uuid = UUID.v1();

    return MappingService.getByName(context, name)
      .then((mapping) => {
        // check if there is a mapping with the same name already exist
        if (mapping) {
          throw new Error(`Mapping ${name} already exists`);
        }

        // get the aggregate for the new mapping
        return MappingService.getAggregate(uuid);
      })
      .then((aggregate) => {
        // node aggregate checks whether the node already exist before executing the CreateMapping command
        return aggregate.handle(new CreateMapping(name, properties));
      })
      .then((state) => {
        // if aggregate is active, then return the mapping. Fail otherwise
        switch (state.stateName) {
          case Active.STATE_NAME:
            return (state as Active<Mapping>).payload;
          default:
            throw new Error(`Mapping ${uuid} is in an inconsistent state`);
        }
      });
  }

  /**
   * Set mapping properties.
   *
   * @param {ExecutionContext} context - Execution context
   * @param {string} uuid - Mapping uuid
   * @param {MappingProperties} properties - Mapping properties
   * @returns {Promise<Mapping>} A promise that contains the mapping just updated
   */
  public static setProperties(
    context: ExecutionContext,
    uuid: string,
    properties: MappingProperties
  ): Promise<Mapping> {
    // TODO validate
    // TODO check permissions

    // get the mapping aggregate
    return MappingService.getAggregate(uuid)
      .then((aggregate) => {
        // mapping aggregate check whether the mapping exist before executing the SetMappingProperties command
        return aggregate.handle(new SetMappingProperties(properties));
      })
      .then((state) => {
        // if aggregate is active, then return the mapping. Otherwise return null
        switch (state.stateName) {
          case Active.STATE_NAME:
            return (state as Active<Mapping>).payload;
          default:
            throw new Error(`Mapping ${uuid} is in an inconsistent state`);
        }
      });
  }

  private static getAggregate(uuid: string): Promise<MappingAggregate> {
    return MappingAggregate.build(uuid);
  }
}
