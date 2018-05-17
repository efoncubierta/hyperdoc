import { Message } from "./Message";

export abstract class Command extends Message {
  public static readonly MESSAGE_TYPE = "Command";

  // metadata
  public readonly $message: string = Command.MESSAGE_TYPE;
  public readonly $command: string;
}
