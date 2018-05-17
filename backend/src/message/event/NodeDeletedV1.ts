import { Event } from "hyperdoc-eventstore";

export class NodeDeletedV1 extends Event {
  public static readonly NAME = "NodeDeleted";

  // metadata
  public readonly $event: string = NodeDeletedV1.NAME;
  public readonly $version: string = "1";
}
