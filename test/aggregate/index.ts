import "mocha";

// test suites
import mappingAggregateTest from "./MappingAggregate.test";
import nodeAggregateTest from "./NodeAggregate.test";

function aggregateTests() {
  describe("Aggregate", () => {
    mappingAggregateTest();
    nodeAggregateTest();
  });
}

export default aggregateTests;
