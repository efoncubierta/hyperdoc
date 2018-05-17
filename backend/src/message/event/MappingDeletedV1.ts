import { Event } from "hyperdoc-eventstore";

export class MappingDeletedV1 extends Event {
  public static readonly NAME = "MappingDeleted";

  // metadata
  public readonly $event: string = MappingDeletedV1.NAME;
  public readonly $version: string = "1";
}
