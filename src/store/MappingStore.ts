// External dependencies
import { Option } from "fp-ts/lib/Option";

// Hyperdoc models
import { Mapping } from "../model/Mapping";

export interface MappingStore {
  list(): Promise<Mapping[]>;
  get(uuid: string): Promise<Option<Mapping>>;
  getByName(name: string): Promise<Option<Mapping>>;
  put(mapping: Mapping): Promise<void>;
  delete(uuid: string): Promise<void>;
}
