import { Mapping } from "../model/Mapping";

export interface MappingStore {
  list(): Promise<Mapping[]>;
  get(uuid: string): Promise<Mapping>;
  getByName(name: string): Promise<Mapping>;
  put(mapping: Mapping): Promise<void>;
  delete(uuid: string): Promise<void>;
}
