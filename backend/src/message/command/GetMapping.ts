import { Command } from "hyperdoc-eventstore";

export class GetMapping extends Command {
  public static readonly NAME = "GetMapping";

  // metadata
  public readonly $command: string = GetMapping.NAME;
}
