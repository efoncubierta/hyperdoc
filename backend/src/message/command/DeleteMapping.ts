import { Command } from "hyperdoc-eventstore";

export class DeleteMapping extends Command {
  public static readonly NAME = "DeleteMapping";

  constructor() {
    super(DeleteMapping.NAME);
  }
}
