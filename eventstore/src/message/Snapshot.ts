import { Message } from "./Message";
import { State } from "../state/State";

export class Snapshot<S extends State<any>> extends Message {
  public static readonly MESSAGE_TYPE = "Snapshot";

  public readonly $message: string = Snapshot.MESSAGE_TYPE;

  public readonly state: S;

  constructor(state: S) {
    super();
    this.state = state;
  }
}
