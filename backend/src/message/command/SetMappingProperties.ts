import { Command } from "eventum-sdk";
import { MappingProperties } from "hyperdoc-core";

export class SetMappingProperties extends Command {
  public static readonly NAME = "SetMappingProperties";

  // data
  public readonly properties: MappingProperties;

  constructor(properties: MappingProperties) {
    super(SetMappingProperties.NAME);
    this.properties = properties;
  }
}
