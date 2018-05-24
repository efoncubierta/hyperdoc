import * as path from "path";
import "mocha";

import { Eventum } from "eventum-sdk";

// test suites
import mappingAggregateTest from "./MappingAggregate.test";
import nodeAggregateTest from "./NodeAggregate.test";

// configure eventum for testing
Eventum.setConfigFile(path.join(__dirname, "../eventum.yml"));

describe("Backend :: Aggregate", () => {
  mappingAggregateTest();
  nodeAggregateTest();
});
