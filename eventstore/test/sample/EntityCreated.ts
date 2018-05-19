import { Event } from "../../src/message/Event";

export class EntityCreated extends Event {
  public static readonly NAME = "EntityCreated";

  // data
  public readonly property1: string;
  public readonly property2: string;
  public readonly property3: number;

  constructor(aggregateId: string, sequence: number, property1: string, property2: string, property3: number) {
    super(EntityCreated.NAME, aggregateId, sequence);
    this.property1 = property1;
    this.property2 = property2;
    this.property3 = property3;
  }
}
