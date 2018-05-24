import { Command } from "eventum-sdk";

export class GetMapping extends Command {
  public static readonly NAME = "GetMapping";

  constructor() {
    super(GetMapping.NAME);
  }
}
