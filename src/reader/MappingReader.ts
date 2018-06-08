// External dependencies
import { Option } from "fp-ts/lib/Option";

// Hyperdoc
import { ExecutionContext } from "../ExecutionContext";

// Hyperdoc models
import { Mappings, Mapping, MappingId } from "../model/Mapping";

// Hyperdoc stores
import { StoreFactory } from "../store/StoreFactory";

/**
 * Service to manage mappings from the user space.
 */
export class MappingReader {
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
}
