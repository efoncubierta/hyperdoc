import * as _ from "underscore";
import { Mapping, Mappings } from "../../../src/model/Mapping";
import MappingStore from "../../../src/store/MappingStore";

/**
 * Manage mapping data in memory.
 */
export default class MappingInmemoryStore implements MappingStore {
  private mappings: Mapping[] = [];

  public list(): Promise<Mappings> {
    const mappingsDic: Mappings = {};
    this.mappings.forEach((mapping) => {
      mappingsDic[mapping.name] = mapping;
    });
    return Promise.resolve(mappingsDic);
  }

  public get(uuid: string): Promise<Mapping> {
    const mapping = _.find(this.mappings, (i) => {
      return i.uuid === uuid;
    });

    return Promise.resolve(mapping);
  }

  public getByName(name: string): Promise<Mapping> {
    const mapping = _.find(this.mappings, (i) => {
      return i.name === name;
    });

    return Promise.resolve(mapping);
  }

  public save(mapping: Mapping): Promise<Mapping> {
    // remove existing mapping with same UUID
    this.mappings = _.filter(this.mappings, (i) => {
      return i.uuid !== mapping.uuid;
    });

    // push mapping to the array
    this.mappings.push(mapping);

    // return saved mapping
    return Promise.resolve(mapping);
  }
}
