import { Command } from "../../../src/message/Command";

export class GetUserCommand extends Command {
  public static readonly NAME = "GetUser";

  // metadata
  public readonly $command: string = GetUserCommand.NAME;
}
