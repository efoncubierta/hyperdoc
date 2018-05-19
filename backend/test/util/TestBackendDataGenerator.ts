import * as faker from "faker";
import { AuthenticationContext, ExecutionContext } from "../../src/service/ExecutionContext";

import { TestDataGenerator } from "../../../core/test/util/TestDataGenerator";
import { AggregateConfig } from "hyperdoc-eventstore";

// cross reference to hyperdoc-eventstore module
import { JournalInMemoryStore } from "../../../eventstore/test/store/inmemory/JournalInMemoryStore";
import { SnapshotInMemoryStore } from "../../../eventstore/test/store/inmemory/SnapshotInMemoryStore";

export class TestBackendDataGenerator extends TestDataGenerator {
  public static randomAuthenticationContext(): AuthenticationContext {
    return {
      userUuid: TestDataGenerator.randomUUID()
    };
  }

  public static randomExecutionContext(): ExecutionContext {
    return {
      auth: this.randomAuthenticationContext(),
      aggregate: {
        config: {
          snapshot: {
            interval: 10
          },
          stores: {
            journal: new JournalInMemoryStore(),
            snapshot: new SnapshotInMemoryStore()
          }
        }
      }
    };
  }
}
