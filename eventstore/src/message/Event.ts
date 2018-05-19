import { Message } from "./Message";

export abstract class Event extends Message {
  public static readonly MESSAGE_TYPE = "Event";

  // metadata
  public readonly $event: string;
  public readonly $aggregateId: string;
  public readonly $sequence: number;

  constructor(event: string, aggregateId: string, sequence: number) {
    super(Event.MESSAGE_TYPE);
    this.$event = event;
    this.$aggregateId = aggregateId;
    this.$sequence = sequence;
  }
}
