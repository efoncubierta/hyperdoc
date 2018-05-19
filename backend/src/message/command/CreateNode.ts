import { Command } from "hyperdoc-eventstore";
import { NodeProperties } from "hyperdoc-core";

export class CreateNode extends Command {
  public static readonly NAME = "CreateNode";

  // data
  public readonly mappingName: string;
  public readonly properties: NodeProperties;

  constructor(mappingName: string, properties: NodeProperties) {
    super(CreateNode.NAME);
    this.mappingName = this.mappingName;
    this.properties = properties;
  }
}
