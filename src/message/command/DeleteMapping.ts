// external dependencies
import { Command } from "eventum-sdk";

export class DeleteMapping extends Command {
  public static readonly NAME = "DeleteMapping";

  constructor() {
    super(DeleteMapping.NAME);
  }
}
