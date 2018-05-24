import { Event } from "eventum-sdk";

export class NodeDeletedV1 extends Event<{}> {
  public static readonly NAME = "NodeDeleted";

  constructor(aggregateId: string, sequence: number) {
    super(NodeDeletedV1.NAME, aggregateId, sequence);
  }
}
