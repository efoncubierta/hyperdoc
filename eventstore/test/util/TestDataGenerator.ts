import * as faker from "faker";

import { GetEntity } from "../sample/GetEntity";
import { CreateEntity } from "../sample/CreateEntity";
import { UpdateEntity } from "../sample/UpdateEntity";
import { DeleteEntity } from "../sample/DeleteEntity";
import { EntityCreated } from "../sample/EntityCreated";
import { EntityUpdated } from "../sample/EntityUpdated";
import { EntityDeleted } from "../sample/EntityDeleted";
import { Command, AggregateConfig } from "../../src";

import { SnapshotInMemoryStore } from "../store/inmemory/SnapshotInmemoryStore";
import { JournalInMemoryStore } from "../store/inmemory/JournalInmemoryStore";

export class TestDataGenerator {
  public static randomGetEntity(): GetEntity {
    return new GetEntity();
  }

  public static randomDeleteEntity(): DeleteEntity {
    return new DeleteEntity();
  }

  public static randomCreateEntity(): CreateEntity {
    return new CreateEntity(faker.lorem.sentence(), faker.lorem.sentence(), faker.random.number(1000));
  }

  public static randomUpdateEntity(): UpdateEntity {
    return new UpdateEntity(faker.lorem.sentence(), faker.lorem.sentence(), faker.random.number(1000));
  }

  public static randomNotSupportedCommand(): Command {
    return {
      $message: "Command",
      $command: "NotSupportedCommand"
    };
  }

  public static randomEntityCreated(sequence?: number): EntityCreated {
    return new EntityCreated(
      this.randomUUID(),
      sequence ? sequence : this.randomSequence(),
      faker.lorem.sentence(),
      faker.lorem.sentence(),
      faker.random.number(1000)
    );
  }

  public static randomEntityUpdated(sequence?: number): EntityUpdated {
    return new EntityUpdated(
      this.randomUUID(),
      sequence ? sequence : this.randomSequence(),
      faker.lorem.sentence(),
      faker.lorem.sentence(),
      faker.random.number(1000)
    );
  }

  public static randomEntityDeleted(sequence?: number): EntityDeleted {
    return new EntityDeleted(this.randomUUID(), sequence ? sequence : this.randomSequence());
  }

  public static randomSequence(): number {
    return faker.random.number(1000);
  }

  public static randomEmail(): string {
    return faker.internet.email();
  }

  public static randomUsername(): string {
    return faker.random.word().replace(" ", "");
  }

  public static randomUUID(): string {
    return faker.random.uuid();
  }

  public static getAggregateConfig(): AggregateConfig {
    const journalStore = new JournalInMemoryStore();
    const snapshotStore = new SnapshotInMemoryStore();

    return {
      snapshot: {
        interval: 10
      },
      stores: {
        journal: journalStore,
        snapshot: snapshotStore
      }
    };
  }
}
