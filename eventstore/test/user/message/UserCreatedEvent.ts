import { Event } from "../../../src/message/Event";

export class UserCreatedEvent extends Event {
  public static readonly NAME = "UserCreated";

  // metadata
  public readonly $event: string = UserCreatedEvent.NAME;
  public readonly $version: string = "1";

  // data
  public readonly username: string;
  public readonly email: string;

  constructor(aggregateId: string, username: string, email: string) {
    super(aggregateId);
    this.username = username;
    this.email = email;
  }
}
