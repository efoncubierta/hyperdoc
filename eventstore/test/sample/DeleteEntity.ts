import { Command } from "../../src/message/Command";

export class DeleteEntity extends Command {
  public static readonly NAME = "DeleteEntity";

  constructor() {
    super(DeleteEntity.NAME);
  }
}
