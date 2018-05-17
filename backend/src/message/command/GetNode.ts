import { Command } from "hyperdoc-eventstore";

export class GetNode extends Command {
  public static readonly NAME = "GetNode";

  // metadata
  public readonly $command: string = GetNode.NAME;
}
