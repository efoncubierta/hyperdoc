import * as UUID from "uuid";
import { Active } from "eventum-sdk";
import { ExecutionContext } from "./ExecutionContext";
import { Mappings, Mapping, MappingProperties } from "hyperdoc-core";
import { MappingAggregate } from "../aggregate/MappingAggregate";
import { SetMappingProperties } from "../message/command/SetMappingProperties";
import { GetMapping } from "../message/command/GetMapping";
import { CreateMapping } from "../message/command/CreateMapping";

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
    // return context.stores.mappings.list();
    return Promise.reject("list() is not implemented");
  }

  /**
   * Get a mapping.
   *
   * @param {ExecutionContext} context - Execution context
   * @param {string} uuid - Mapping uuid
   * @returns {Promise<Mapping>} A promise that contains the mapping, or null if missing
   */
  public static get(context: ExecutionContext, uuid: string): Promise<Mapping> {
    return this.getAggregate(context, uuid)
      .then((aggregate) => {
        return aggregate.handle(new GetMapping());
      })
      .then((state) => {
        // if aggregate is active, then return the mapping. Otherwise return null
        switch (state.stateName) {
          case Active.STATE_NAME:
            return (state as Active<Mapping>).payload;
          default:
            return null;
        }
      });
  }

  /**
   * Get a mapping by its name.
   *
   * @param {ExecutionContext} context - Execution context
   * @param {string} name - Mapping name
   * @returns {Promise<Mapping>} A promise that contains the mapping, or null if missing
   */
  public static getByName(context: ExecutionContext, name: string): Promise<Mapping> {
    // return context.stores.mappings.getByName(name).then((mapping) => {
    //   // TODO check permissions
    //   return mapping;
    // });
    return Promise.reject("getByName() is not implemented");
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

    return this.getAggregate(context, UUID.v1())
      .then((aggregate) => {
        return aggregate.handle(new CreateMapping(name, properties));
      })
      .then((state) => {
        // if aggregate is active, then return the mapping. Otherwise return null
        switch (state.stateName) {
          case Active.STATE_NAME:
            return (state as Active<Mapping>).payload;
          default:
            return null;
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

    return this.getAggregate(context, uuid)
      .then((aggregate) => {
        return aggregate.handle(new SetMappingProperties(properties));
      })
      .then((state) => {
        // if aggregate is active, then return the mapping. Otherwise return null
        switch (state.stateName) {
          case Active.STATE_NAME:
            return (state as Active<Mapping>).payload;
          default:
            return null;
        }
      });
  }

  /**
   * Get a mapping or fail.
   *
   * @param {ExecutionContext} context - Execution context
   * @param {string} uuid - Mapping uuid
   * @returns {Promise<Mapping>} A promise that contains the mapping, or it gets rejected
   */
  private static getOrError(context: ExecutionContext, uuid: string): Promise<Mapping> {
    return this.get(context, uuid).then((mapping) => {
      // does the mapping exist?
      if (!mapping) {
        throw new Error(`Mapping ${uuid} does not exist`);
      }

      return mapping;
    });
  }

  private static getAggregate(context: ExecutionContext, uuid: string): Promise<MappingAggregate> {
    return MappingAggregate.build(uuid, context.aggregates.mapping);
  }
}
