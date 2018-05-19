import { Event } from "hyperdoc-eventstore";

export class NodeDeletedV1 extends Event {
  public static readonly NAME = "NodeDeleted";

  constructor(aggregateId: string, sequence: number) {
    super(NodeDeletedV1.NAME, aggregateId, sequence);
  }
}
