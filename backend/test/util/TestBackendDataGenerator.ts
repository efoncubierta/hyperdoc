import * as faker from "faker";
import { AuthenticationContext, ExecutionContext } from "../../src/service/ExecutionContext";

import { TestDataGenerator } from "../../../core/test/util/TestDataGenerator";
import { AggregateConfig } from "hyperdoc-eventstore";

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
        config: {} as AggregateConfig
      }
    };
  }
}
