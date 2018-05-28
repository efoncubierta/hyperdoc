// external dependencies
import { Command } from "eventum-sdk";

// models
import { MappingProperties } from "../../model/Mapping";

export class SetMappingProperties extends Command {
  public static readonly NAME = "SetMappingProperties";

  // data
  public readonly properties: MappingProperties;

  constructor(properties: MappingProperties) {
    super(SetMappingProperties.NAME);
    this.properties = properties;
  }
}
