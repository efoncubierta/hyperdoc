import { DynamoDB } from "aws-sdk";
import { Mapping, MappingKey, Mappings } from "../model/Mapping";

export default interface MappingStore {
  /**
   * Get all mappings.
   *
   * @returns {Promise<Mappings>} A promise that contains a mappings dictionary
   */
  list(): Promise<Mappings>;

  /**
   * Get a mapping by its UUID.
   *
   * @param {string} uuid - Mapping UUID
   * @returns {Promise<Mapping>} A promise that contains the mapping, or null if missing
   */
  get(uuid: string): Promise<Mapping>;

  /**
   * Get a mapping by its name.
   *
   * @param {string} name - Mapping name
   * @returns {Promise<Mapping>} A promise that contains the mapping, or null if missing
   */
  getByName(name: string): Promise<Mapping>;

  /**
   * Create a new mapping.
   *
   * @param mapping - Mapping
   * @returns {Promise<Mapping>} A promise that contains the saved mapping
   */
  save(mapping: Mapping): Promise<Mapping>;
}
