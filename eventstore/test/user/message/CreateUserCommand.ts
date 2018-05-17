import { Command } from "../../../src/message/Command";

export class CreateUserCommand extends Command {
  public static readonly NAME = "CreateUser";

  // metadata
  public readonly $command: string = CreateUserCommand.NAME;

  // data
  public readonly username: string;
  public readonly email: string;

  constructor(username: string, email: string) {
    super();
    this.username = username;
    this.email = email;
  }
}
