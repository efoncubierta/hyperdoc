import { Command } from "hyperdoc-eventstore";

export class DeleteMapping extends Command {
  public static readonly NAME = "DeleteMapping";

  // metadata
  public readonly $command: string = DeleteMapping.NAME;
}
