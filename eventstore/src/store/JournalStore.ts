import { Event } from "../message/Event";

export interface Status {
  success: boolean;
}

export interface ErrorStatus<T> {
  reason: string;
  item: T;
}

export interface BatchStatus<T> {
  success: boolean;
  errors?: Array<ErrorStatus<T>>;
}

export interface JournalStore {
  /**
   * Save a batch of events.
   *
   * Depending on the data store, it is possible to store all the events within the same transaction. However,
   * that won't be possible in some other data stores. This method assumes the worst case i.e. an atomic transaction
   * for each event. Although leaves the single transaction option open to the event store implementor. The reason
   * to save events in batches is due to some performance optimisations in some data stores when saving in batches.
   *
   * Assuming an atomic transaction for each event, each transaction can run simultanously. It really doesn't
   * matter as long as each one of them has a sequence number, which will be used to sort and replay the chain of
   * events.
   *
   * This action is executed asynchronously, returning a promise with a {@link BatchStatus}. If there were failures
   * saving one of the events, the promise would be rejected. It will only resolve when all the events in the batch
   * have been successfuly saved. Any other general failure will also reject the promise i.e. DB connectivity issues.
   *
   * A rejected promise can potentially leave the store in an inconsistent state. It is up the caller to either
   * roll back {@link rollbackTo} to a previous sequence number, retry with the same batch of events, or just
   * assume the event store is in an inconsistent state.
   *
   * @param events Array of events
   */
  saveAll(events: Event[]): Promise<BatchStatus<Event>>;

  /**
   * Rollback events from a certain point in time.
   *
   * When the event store is in an inconsistent state, due to a partially saved batch of events, the caller can
   * rollback to the latest consistent state by deleting events created after a specific sequence number.
   *
   * However, if a snapshot has been created, it won't be possible to rollback past the snapshot sequence number. But
   * still, this action will rollback as many as event as there were available after the snapshot was created.
   *
   * This action is executed asynchronously, returning a promise with a {@link BatchStatus}. If there was a failure
   * rolling back to a certain point (i.e. due to an existing snapshot interfeering), the promise would be rejected.
   * It will only resolve when all the events were rolled back.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Least sequence number to be included (i.e. range [sequence, last])
   */
  rollbackTo(aggregateId: string, sequence: number): Promise<BatchStatus<Event>>;

  /**
   * Roll-forward events since the begining until a certain point in time.
   *
   * When a snapshot is created, all the events created before that snapshot are deleted. Aggregates are built from the
   * begining of time or the latest snapshot. Therefore keeping older events in the database is point less, as they'll
   * be backed up in the long-term event store.
   *
   * The sequence number may not match an snapshot sequence number and, therefore, this action could delete events
   * past the snapshot sequence number.
   *
   * This action is executed asynchronously, returning a promise with a {@link BatchStatus}. If there was a failure
   * rolling forward to a certain point, the promise would be rejected. It will only resolve when all events are
   * rolled forward.
   *
   * @param aggregateId Aggregate ID
   * @param sequence Last sequence number to be included (i.e. range [first, sequence])
   */
  rollforwardTo(aggregateId: string, sequence: number): Promise<BatchStatus<Event>>;

  /**
   * Get a range of events for a particular aggregate.
   *
   * This action is executed asynchronously, returning a promise with {@link Event[]}. If there was a failure
   * loading the events, the promise would be rejected. If no events were found, and empty array would be returned.
   *
   * @param aggregateId Aggregate ID
   * @param fromSequence Start sequence number
   * @param toSequence End sequence number
   */
  getEvents(aggregateId: string, fromSequence: number, toSequence: number): Promise<Event[]>;

  /**
   * Get the last sequence number for a particular aggregate.
   *
   * This action can be expensive if there are too many entries in the journal for the aggregate, as not all
   * data stores supports the MAX function. That's the reason to add a second parameter, fromSequence, to this method.
   * You'll use the snapshot sequence, if any, or 0 if there are no snapshots for the aggregate.
   *
   * This action is executed asynchronously, returning a promise with a {@link number}. If there was a failure getting
   * the last sequence number, the promise would be rejected. If there are no events for that aggregate, it'll return 0.
   *
   * @param aggregateId Aggregate ID
   * @param fromSequence Start sequence number
   */
  getLastSequence(aggregateId: string, fromSequence: number): Promise<number>;
}
