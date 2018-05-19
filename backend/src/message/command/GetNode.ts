import { Command } from "hyperdoc-eventstore";

export class GetNode extends Command {
  public static readonly NAME = "GetNode";

  constructor() {
    super(GetNode.NAME);
  }
}
