import { Command } from "hyperdoc-eventstore";

export class GetMapping extends Command {
  public static readonly NAME = "GetMapping";

  constructor() {
    super(GetMapping.NAME);
  }
}
