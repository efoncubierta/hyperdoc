import { DynamoDB } from "aws-sdk";
import { IMapping, IMappingKey, IMappings } from "../model/IMapping";

export default interface IMappingStore {
  /**
   * Get all mappings.
   *
   * @returns {Promise<IMappings>} A promise that contains a mappings dictionary
   */
  list(): Promise<IMappings>;

  /**
   * Get a mapping by its UUID.
   *
   * @param {string} uuid - Mapping UUID
   * @returns {Promise<IMapping>} A promise that contains the mapping, or null if missing
   */
  get(uuid: string): Promise<IMapping>;

  /**
   * Get a mapping by its name.
   *
   * @param {string} name - Mapping name
   * @returns {Promise<IMapping>} A promise that contains the mapping, or null if missing
   */
  getByName(name: string): Promise<IMapping>;

  /**
   * Create a new mapping.
   *
   * @param mapping - Mapping
   * @returns {Promise<IMapping>} A promise that contains the saved mapping
   */
  save(mapping: IMapping): Promise<IMapping>;
}
