import { JournalStore } from "./store/JournalStore";
import { SnapshotStore } from "./store/SnapshotStore";

export interface AggregateSnapshotConfig {
  interval: number;
}

export interface AggregateStoresConfig {
  journal: JournalStore;
  snapshot: SnapshotStore;
}

export interface AggregateConfig {
  snapshot: AggregateSnapshotConfig;
  stores: AggregateStoresConfig;
}
