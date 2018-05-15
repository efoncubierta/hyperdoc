import * as UUID from "uuid";

import { ExecutionContext } from "../model/ExecutionContext";
import {
  MappingKey,
  Mapping,
  MappingProperties,
  MappingBuilder,
  MappingPropertyType,
  MappingProperty,
  Mappings
} from "../model/Mapping";

/**
 * Service to manage mappings from the user space.
 */
export default class MappingService {
  /**
   * Get all mappings.
   *
   * @param {ExecutionContext} context - Execution context
   * @returns {Promise<Mappings>} A promise that contains a mappings dictionary
   */
  public static list(context: ExecutionContext): Promise<Mappings> {
    return context.stores.mappings.list();
  }

  /**
   * Get a mapping.
   *
   * @param {ExecutionContext} context - Execution context
   * @param {string} uuid - Mapping uuid
   * @returns {Promise<Mapping>} A promise that contains the mapping, or null if missing
   */
  public static get(context: ExecutionContext, uuid: string): Promise<Mapping> {
    return context.stores.mappings.get(uuid).then((mapping) => {
      // TODO check permissions
      return mapping;
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
    return context.stores.mappings.getByName(name).then((mapping) => {
      // TODO check permissions
      return mapping;
    });
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
    // TODO check permissions

    // build mapping with new UUID
    const mapping = new MappingBuilder()
      .uuid(UUID.v1())
      .name(name)
      .properties(properties)
      .build();

    return context.stores.mappings.save(mapping);
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
    return this.getOrError(context, uuid).then((mapping) => {
      // TODO check permissions

      // set new mapping details
      const m = new MappingBuilder(mapping).properties(properties).build();

      // ... and save it
      return context.stores.mappings.save(mapping);
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
}
