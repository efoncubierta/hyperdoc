// External dependencies
import { Option } from "fp-ts/lib/Option";

// Hyperdoc models
import { Mapping, MappingId } from "../model/Mapping";

export interface MappingStore {
  list(): Promise<Mapping[]>;
  get(mappingId: MappingId): Promise<Option<Mapping>>;
  getByName(name: string): Promise<Option<Mapping>>;
  put(mapping: Mapping): Promise<void>;
  delete(mappingId: MappingId): Promise<void>;
}
