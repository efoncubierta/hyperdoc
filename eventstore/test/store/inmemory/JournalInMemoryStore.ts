import { JournalStore, Event } from "../../../src";
import { BatchStatus } from "../../../src/store/JournalStore";

/**
 * Manage journals in memory.
 */
export class JournalInMemoryStore implements JournalStore {
  private events: Event[] = [];

  public saveAll(events: Event[]): Promise<BatchStatus<Event>> {
    events.forEach((event) => this.events.push(event));

    return Promise.resolve({
      success: true
    });
  }

  public rollbackTo(aggregateId: string, sequence: number): Promise<BatchStatus<Event>> {
    const es = this.events.filter((event) => {
      return event.$aggregateId === aggregateId && event.$sequence >= sequence;
    });
    this.events = es;

    return Promise.resolve({
      success: true
    });
  }

  public rollforwardTo(aggregateId: string, sequence: number): Promise<BatchStatus<Event>> {
    const es = this.events.filter((event) => {
      return event.$aggregateId === aggregateId && event.$sequence <= sequence;
    });
    this.events = es;

    return Promise.resolve({
      success: true
    });
  }

  public getEvents(aggregateId: string, fromSequence: number, toSequence: number): Promise<Event[]> {
    const es = this.events.filter((event) => {
      return event.$aggregateId === aggregateId && event.$sequence >= fromSequence && event.$sequence <= toSequence;
    });

    return Promise.resolve(es);
  }

  public getLastSequence(aggregateId: string, fromSequence: number): Promise<number> {
    const sequence = this.events.reduce((last, current) => Math.max(last, current.$sequence), 0);
    return Promise.resolve(sequence);
  }
}
