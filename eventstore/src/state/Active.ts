import { State } from "./State";

export class Active<T> extends State<T> {
  public static readonly NAME = "Active";

  // metadata
  public readonly $state: string = Active.NAME;

  // data
  public readonly data: T;

  constructor(data: T) {
    super();
    this.data = data;
  }
}
