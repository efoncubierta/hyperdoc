// external dependencies
import { Command } from "eventum-sdk";

// models
import { NodeProperties } from "../../model/Node";

export class SetNodeProperties extends Command {
  public static readonly NAME = "SetNodeProperties";

  // data
  public readonly properties: NodeProperties;

  constructor(properties: NodeProperties) {
    super(SetNodeProperties.NAME);
    this.properties = properties;
  }
}
