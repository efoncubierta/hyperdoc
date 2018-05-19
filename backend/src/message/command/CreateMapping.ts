import { Command } from "hyperdoc-eventstore";
import { MappingProperties } from "hyperdoc-core";

export class CreateMapping extends Command {
  public static readonly NAME = "CreateMapping";

  // data
  public readonly name: string;
  public readonly properties: MappingProperties;

  constructor(name: string, properties: MappingProperties) {
    super(CreateMapping.NAME);
    this.name = name;
    this.properties = properties;
  }
}
