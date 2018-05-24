import { Command } from "eventum-sdk";
import { NodeProperties } from "hyperdoc-core";

export class CreateNode extends Command {
  public static readonly NAME = "CreateNode";

  // data
  public readonly mappingName: string;
  public readonly properties: NodeProperties;

  constructor(mappingName: string, properties: NodeProperties) {
    super(CreateNode.NAME);
    this.mappingName = mappingName;
    this.properties = properties;
  }
}
