import { State } from "./state/State";
import { Command } from "./message/Command";
import { AggregateConfig } from "./AggregateConfig";
import { Snapshot } from "./message/Snapshot";
import { Event } from "./message/Event";
import { JournalStore } from "./store/JournalStore";
import { SnapshotStore } from "./store/SnapshotStore";

export interface IAggregate<T, S extends State<T>, C extends Command> {
  handle(command: C): Promise<S>;
  rehydrate(): Promise<S>;
}

export abstract class Aggregate<T, S extends State<T>, C extends Command, E extends Event>
  implements IAggregate<T, S, C> {
  // aggregate configuration
  protected readonly aggregateId: string;
  protected readonly config: AggregateConfig;

  // stores
  private readonly journalStore: JournalStore;
  private readonly snapshotStore: SnapshotStore;

  // last sequence of events
  private lastSequence: number = 0;

  /**
   * Constructor.
   *
   * @param aggregateId - Aggregate ID
   * @param config - Aggregate configuration
   */
  protected constructor(aggregateId: string, config: AggregateConfig) {
    this.aggregateId = aggregateId;
    this.config = config;

    // TODO validate config
    if (!config.stores || !config.stores.journal) {
      throw new Error("A JournalStore is required");
    }

    if (!config.stores || !config.stores.snapshot) {
      throw new Error("A SnapshotStore is required");
    }

    this.journalStore = config.stores.journal;
    this.snapshotStore = config.stores.snapshot;
  }

  public abstract handle(command: C): Promise<S>;

  protected abstract currentState(): S;

  protected abstract aggregateEvent(event: E);

  protected abstract aggregateSnapshot(snapshot: Snapshot);

  protected getLastSequence() {
    return this.lastSequence;
  }

  protected getNextSequence() {
    return this.lastSequence++;
  }

  protected onRehydrateStarted() {
    // nothing
  }

  protected onRehydrateComplete() {
    // nothing
  }

  protected onRehydrateFailed() {
    // nothing
  }

  protected onSaveFailure() {
    // nothing
  }

  protected aggregate(msg: E | Snapshot) {
    switch (msg.$message) {
      case Event.MESSAGE_TYPE:
        this.aggregateEvent(msg as E);
        break;
      case Snapshot.MESSAGE_TYPE:
        this.aggregateSnapshot(msg as Snapshot);
        break;
      default:
      // TODO HANDLE ERROR
    }
  }

  public rehydrate(): Promise<S> {
    // get last sequence number
    return this.journalStore.getLastSequence(this.aggregateId, this.lastSequence).then((lastSequence) => {
      this.lastSequence = lastSequence;
      // get latest snapshot
      return this.snapshotStore.get(this.aggregateId).then((snapshot) => {
        // aggregate the snapshot if found
        if (snapshot) {
          this.aggregate(snapshot as Snapshot);
        }

        // get all remaining events since the snapshot sequence or the very begining
        const fromSequence = snapshot ? snapshot.$sequence : 0;
        return this.journalStore.getEvents(this.aggregateId, fromSequence, lastSequence).then((events) => {
          // aggregate each event
          events.forEach((event) => this.aggregate(event as E));

          return this.currentState();
        });
      });
    });
  }

  protected save(event: E): Promise<E> {
    return this.journalStore.saveAll([event]).then((status) => {
      // TODO create snapshot
      return event;
    });
  }

  protected saveSnapshot(): Promise<void> {
    // TODO persist in DB
    const snapshot = new Snapshot(this.aggregateId, this.lastSequence, this.currentState());
    return this.snapshotStore.save(snapshot);
  }
}
