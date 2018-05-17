import { Command } from "hyperdoc-eventstore";
import { NodeProperties } from "hyperdoc-core";

export class SetNodeProperties extends Command {
  public static readonly NAME = "SetNodeProperties";

  // metadata
  public readonly $command: string = SetNodeProperties.NAME;

  // data
  public readonly properties: NodeProperties;

  constructor(properties: NodeProperties) {
    super();
    this.properties = properties;
  }
}
