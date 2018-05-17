import { Command } from "hyperdoc-eventstore";
import { MappingProperties } from "hyperdoc-core";

export class SetMappingProperties extends Command {
  public static readonly NAME = "SetMappingProperties";

  // metadata
  public readonly $command: string = SetMappingProperties.NAME;

  // data
  public readonly properties: MappingProperties;

  constructor(properties: MappingProperties) {
    super();
    this.properties = properties;
  }
}
