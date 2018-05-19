import { Command } from "hyperdoc-eventstore";
import { NodeProperties } from "hyperdoc-core";

export class SetNodeProperties extends Command {
  public static readonly NAME = "SetNodeProperties";

  // data
  public readonly properties: NodeProperties;

  constructor(properties: NodeProperties) {
    super(SetNodeProperties.NAME);
    this.properties = properties;
  }
}
