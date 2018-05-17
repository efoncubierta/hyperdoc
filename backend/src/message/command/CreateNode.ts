import { Command } from "hyperdoc-eventstore";
import { NodeProperties } from "hyperdoc-core";

export class CreateNode extends Command {
  public static readonly NAME = "CreateNode";

  // metadata
  public readonly $command: string = CreateNode.NAME;

  // data
  public readonly mappingName: string;
  public readonly properties: NodeProperties;

  constructor(mappingName: string, properties: NodeProperties) {
    super();
    this.mappingName = this.mappingName;
    this.properties = properties;
  }
}
