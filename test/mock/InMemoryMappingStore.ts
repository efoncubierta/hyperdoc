import { Mapping } from "../../src/model";

export class InMemoryMappingStore {
  private static mappings: Mapping[] = [];

  public static get(uuid: string): Mapping {
    return InMemoryMappingStore.mappings.find((mapping) => {
      return mapping.uuid === uuid;
    });
  }

  public static findByName(name: string): Mapping[] {
    return InMemoryMappingStore.mappings.filter((mapping) => {
      return mapping.name === name;
    });
  }

  public static put(mapping: Mapping): void {
    InMemoryMappingStore.delete(mapping.uuid);
    InMemoryMappingStore.mappings.push(mapping);
  }

  public static delete(uuid: string): void {
    InMemoryMappingStore.mappings = InMemoryMappingStore.mappings.filter((mapping) => {
      return !(mapping.uuid === uuid);
    });
  }
}
