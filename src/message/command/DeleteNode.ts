// external dependencies
import { Command } from "eventum-sdk";

export class DeleteNode extends Command {
  public static readonly NAME = "DeleteNode";

  constructor() {
    super(DeleteNode.NAME);
  }
}
