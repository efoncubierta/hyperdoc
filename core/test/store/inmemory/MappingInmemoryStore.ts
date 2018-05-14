import * as _ from "underscore";
import { IMapping, IMappings } from "../../../src/model/IMapping";
import IMappingStore from "../../../src/store/IMappingStore";

/**
 * Manage mapping data in memory.
 */
export default class MappingInmemoryStore implements IMappingStore {
  private mappings: IMapping[] = [];

  public list(): Promise<IMappings> {
    const mappingsDic: IMappings = {};
    this.mappings.forEach((mapping) => {
      mappingsDic[mapping.name] = mapping;
    });
    return Promise.resolve(mappingsDic);
  }

  public get(uuid: string): Promise<IMapping> {
    const mapping = _.find(this.mappings, (i) => {
      return i.uuid === uuid;
    });

    return Promise.resolve(mapping);
  }

  public getByName(name: string): Promise<IMapping> {
    const mapping = _.find(this.mappings, (i) => {
      return i.name === name;
    });

    return Promise.resolve(mapping);
  }

  public save(mapping: IMapping): Promise<IMapping> {
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
