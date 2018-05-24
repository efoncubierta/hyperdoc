import { Command } from "eventum-sdk";

export class GetNode extends Command {
  public static readonly NAME = "GetNode";

  constructor() {
    super(GetNode.NAME);
  }
}
