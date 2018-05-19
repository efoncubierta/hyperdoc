import { Message } from "./Message";
import { State } from "../state/State";

export class Snapshot extends Message {
  public static readonly MESSAGE_TYPE = "Snapshot";

  // metadata
  public readonly $aggregateId: string;
  public readonly $sequence: number;

  // data
  public readonly state: State<any>;

  constructor(aggregateId: string, sequence: number, state: State<any>) {
    super(Snapshot.MESSAGE_TYPE);
    this.$aggregateId = aggregateId;
    this.$sequence = sequence;
    this.state = state;
  }
}
