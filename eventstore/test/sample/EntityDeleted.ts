import { Event } from "../../src/message/Event";

export class EntityDeleted extends Event {
  public static readonly NAME = "EntityDeleted";

  constructor(aggregateId: string, sequence: number) {
    super(EntityDeleted.NAME, aggregateId, sequence);
  }
}
