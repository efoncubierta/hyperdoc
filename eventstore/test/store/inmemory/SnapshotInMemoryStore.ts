import { SnapshotStore, Event, Snapshot } from "../../../src";
import { BatchStatus } from "../../../src/store/JournalStore";

/**
 * Manage snapshots in memory.
 */
export class SnapshotInMemoryStore implements SnapshotStore {
  private snapshots: Snapshot[] = [];

  public get(aggregateId: string): Promise<Snapshot> {
    const snapshot = this.snapshots.find((s) => {
      return s.$aggregateId === aggregateId;
    });

    return Promise.resolve(snapshot);
  }

  public save(snapshot: Snapshot): Promise<void> {
    this.snapshots.push(snapshot);
    return Promise.resolve(null);
  }

  public rollforwardTo(aggregateId: string, sequence: number): Promise<void> {
    const es = this.snapshots.filter((snapshot) => {
      return snapshot.$aggregateId === aggregateId && snapshot.$sequence <= sequence;
    });
    this.snapshots = es;

    return Promise.resolve(null);
  }
}
