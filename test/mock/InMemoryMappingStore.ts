import { Mapping, MappingId } from "../../src/model/Mapping";

export class InMemoryMappingStore {
  private static mappings: Mapping[] = [];

  public static get(mappingId: MappingId): Mapping {
    return InMemoryMappingStore.mappings.find((mapping) => {
      return mapping.mappingId === mappingId;
    });
  }

  public static findByName(name: string): Mapping[] {
    return InMemoryMappingStore.mappings.filter((mapping) => {
      return mapping.name === name;
    });
  }

  public static put(mapping: Mapping): void {
    InMemoryMappingStore.delete(mapping.mappingId);
    InMemoryMappingStore.mappings.push(mapping);
  }

  public static delete(mappingId: MappingId): void {
    InMemoryMappingStore.mappings = InMemoryMappingStore.mappings.filter((mapping) => {
      return !(mapping.mappingId === mappingId);
    });
  }
}
