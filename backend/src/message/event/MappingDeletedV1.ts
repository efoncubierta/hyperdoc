import { Event } from "hyperdoc-eventstore";

export class MappingDeletedV1 extends Event {
  public static readonly NAME = "MappingDeleted";

  constructor(aggregateId: string, sequence: number) {
    super(MappingDeletedV1.NAME, aggregateId, sequence);
  }
}
