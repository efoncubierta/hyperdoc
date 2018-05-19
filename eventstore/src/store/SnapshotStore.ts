import { Snapshot } from "../message/Snapshot";
import { State } from "../state/State";

export interface SnapshotStore {
  /**
   * Get current snapshot.
   *
   * This action is executed asynchronously, returning a promise with a {@link Snapshot}. If there was a failure
   * getting the snapshot, the promise would be rejected. If there is no snapshot for the aggregate, null
   * will be returned.
   *
   * @param aggregateId Aggregate ID
   */
  get(aggregateId: string): Promise<Snapshot>;

  /**
   * Save a snapshot.
   *
   * @param snapshot Snapshot
   */
  save(snapshot: Snapshot): Promise<void>;

  /**
   * Roll-forward snapshots since the begining of time until an event sequence.
   *
   * This action is executed asynchronously, returning a promise. If there was a failure rolling forward to a certain
   * point, the promise would be rejected.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Last sequence number to be included (i.e. range [first, sequence])
   */
  rollforwardTo(aggregateId: string, sequence: number): Promise<void>;
}
