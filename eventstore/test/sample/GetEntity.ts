import { Command } from "../../src/message/Command";

export class GetEntity extends Command {
  public static readonly NAME = "GetEntity";

  constructor() {
    super(GetEntity.NAME);
  }
}
