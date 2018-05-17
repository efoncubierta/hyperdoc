import { Command } from "hyperdoc-eventstore";
import { MappingProperties } from "hyperdoc-core";

export class CreateMapping extends Command {
  public static readonly NAME = "CreateMapping";

  // metadata
  public readonly $command: string = CreateMapping.NAME;

  // data
  public readonly name: string;
  public readonly properties: MappingProperties;

  constructor(name: string, properties: MappingProperties) {
    super();
    this.name = name;
    this.properties = properties;
  }
}
