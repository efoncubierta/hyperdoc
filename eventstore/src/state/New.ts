import { State } from "./State";

export class New<T> extends State<any> {
  public static readonly NAME = "New";

  // metadata
  public readonly $state: string = New.NAME;
}
