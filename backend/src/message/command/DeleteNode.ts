import { Command } from "hyperdoc-eventstore";

export class DeleteNode extends Command {
  public static readonly NAME = "DeleteNode";

  constructor() {
    super(DeleteNode.NAME);
  }
}
