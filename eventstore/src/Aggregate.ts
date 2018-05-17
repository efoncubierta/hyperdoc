import { State } from "./state/State";
import { Command } from "./message/Command";
import { AggregateConfig } from "./AggregateConfig";
import { Snapshot } from "./message/Snapshot";
import { Event } from "./message/Event";

export interface IAggregate<T, S extends State<T>, C extends Command> {
  handle(command: C): Promise<S>;
}

export abstract class Aggregate<T, S extends State<T>, C extends Command, E extends Event>
  implements IAggregate<T, S, C> {
  protected readonly config: AggregateConfig;

  /**
   * Constructor.
   *
   * @param config - Aggregate configuration
   */
  constructor(config: AggregateConfig) {
    this.config = config;

    // rehydrate aggregate
    this.rehydrate();
  }

  public abstract handle(command: C): Promise<S>;

  protected abstract aggregateId(): string;

  protected abstract currentState(): S;

  protected abstract aggregateEvent(event: E);

  protected abstract aggregateSnapshot(snapshot: Snapshot<S>);

  protected onRehydrateStarted() {
    // nothing
  }

  protected onRehydrateComplete() {
    // nothing
  }

  protected onRehydrateFailed() {
    // nothing
  }

  protected aggregate(msg: E | Snapshot<S>) {
    switch (msg.$message) {
      case Event.MESSAGE_TYPE:
        this.aggregateEvent(msg as E);
        break;
      case Snapshot.MESSAGE_TYPE:
        this.aggregateSnapshot(msg as Snapshot<S>);
        break;
      default:
      // TODO HANDLE ERROR
    }
  }

  private rehydrate() {
    // TODO get latest snapshot
    // TODO get latest events since snapshot
  }

  protected save(event: E): Promise<E> {
    // TODO persist in DB
    return Promise.resolve(event)
      .then(() => {
        if (true) {
          return this.saveSnapshot();
        }
      })
      .then(() => {
        return event;
      });
  }

  protected saveSnapshot(): Promise<S> {
    // TODO persist in DB
    const snapshot = new Snapshot(this.currentState());
    return Promise.resolve(this.currentState());
  }
}
