// external dependencies
import { Command } from "eventum-sdk";

// models
import { MappingProperties } from "../../model/Mapping";

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
