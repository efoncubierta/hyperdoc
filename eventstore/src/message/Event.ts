import { Message } from "./Message";

export abstract class Event extends Message {
  public static readonly MESSAGE_TYPE = "Event";

  // metadata
  public readonly $message: string = Event.MESSAGE_TYPE;
  public readonly $event: string;

  public readonly aggregateId: string;

  constructor(aggregateId: string) {
    super();
    this.aggregateId = aggregateId;
  }
}
