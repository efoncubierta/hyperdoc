import { Command } from "../../src/message/Command";

export class CreateEntity extends Command {
  public static readonly NAME = "CreateEntity";

  // data
  public readonly property1: string;
  public readonly property2: string;
  public readonly property3: number;

  constructor(property1: string, property2: string, property3: number) {
    super(CreateEntity.NAME);
    this.property1 = property1;
    this.property2 = property2;
    this.property3 = property3;
  }
}
