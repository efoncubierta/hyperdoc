import { Command } from "hyperdoc-eventstore";

export class DeleteNode extends Command {
  public static readonly NAME = "DeleteNode";

  // metadata
  public readonly $command: string = DeleteNode.NAME;
}
