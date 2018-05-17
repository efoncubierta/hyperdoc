export interface AggregateDBConfig {
  tableName: string;
}

export interface AggregateSnapshotConfig {
  interval: number;
}

export interface AggregateConfig {
  db: AggregateDBConfig;
  snapshot: AggregateSnapshotConfig;
}
