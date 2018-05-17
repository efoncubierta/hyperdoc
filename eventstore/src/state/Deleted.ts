import { State } from "./State";

export class Deleted<T> extends State<T> {
  public static readonly NAME = "Deleted";

  // metadata
  public readonly $state: string = Deleted.NAME;

  // data
  public readonly data: T;

  constructor(data: T) {
    super();
    this.data = data;
  }
}
