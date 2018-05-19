import { Message } from "./Message";

export abstract class Command extends Message {
  public static readonly MESSAGE_TYPE = "Command";

  // metadata
  public readonly $command: string;

  constructor(command: string) {
    super(Command.MESSAGE_TYPE);
    this.$command = command;
  }
}
