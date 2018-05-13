import * as UUID from "uuid";

import { IExecutionContext } from "../model/IExecutionContext";
import {
  IMappingKey,
  IMapping,
  IMappingProperties,
  MappingBuilder,
  IMappingPropertyType,
  IMappingProperty,
  IMappings
} from "../model/IMapping";

/**
 * Service to manage mappings from the user space.
 */
export default class MappingService {
  /**
   * Get all mappings.
   *
   * @param {IExecutionContext} context - Execution context
   * @returns {Promise<IMappings>} A promise that contains a mappings dictionary
   */
  public static list(context: IExecutionContext): Promise<IMappings> {
    return context.stores.mappings.list();
  }

  /**
   * Get a mapping.
   *
   * @param {IExecutionContext} context - Execution context
   * @param {string} uuid - Mapping uuid
   * @returns {Promise<IMapping>} A promise that contains the mapping, or null if missing
   */
  public static get(context: IExecutionContext, uuid: string): Promise<IMapping> {
    return context.stores.mappings.get(uuid).then((mapping) => {
      // TODO check permissions
      return mapping;
    });
  }

  /**
   * Get a mapping by its name.
   *
   * @param {IExecutionContext} context - Execution context
   * @param {string} name - Mapping name
   */
  public static getByName(context: IExecutionContext, name: string): Promise<IMapping> {
    return context.stores.mappings.getByName(name).then((mapping) => {
      // TODO check permissions
      return mapping;
    });
  }

  /**
   * Create a new mapping.
   *
   * @param {IExecutionContext} context - Execution context
   * @param {string} name - Mapping name
   * @param {IMappingProperties} properties - Mapping properties
   * @returns {Promise<IMapping>} A promise that contains the mapping just created
   */
  public static create(context: IExecutionContext, name: string, properties: IMappingProperties): Promise<IMapping> {
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
   * @param {IExecutionContext} context - Execution context
   * @param {string} uuid - Mapping uuid
   * @param {IMappingProperties} properties - Mapping properties
   * @returns {Promise<IMapping>} A promise that contains the mapping just updated
   */
  public static setProperties(
    context: IExecutionContext,
    uuid: string,
    properties: IMappingProperties
  ): Promise<IMapping> {
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
   * @param {IExecutionContext} context - Execution context
   * @param {string} uuid - Mapping uuid
   * @returns {Promise<IMapping>} A promise that contains the mapping, or it gets rejected
   */
  private static getOrError(context: IExecutionContext, uuid: string): Promise<IMapping> {
    return this.get(context, uuid).then((mapping) => {
      // does the mapping exist?
      if (!mapping) {
        throw new Error(`Mapping ${uuid} does not exist`);
      }

      return mapping;
    });
  }
}
