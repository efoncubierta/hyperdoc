import "mocha";

// test suites
import mappingDynamoDBStoreTests from "./MappingDynamoDBStore.test";

function storeTests() {
  describe("AWS", () => {
    mappingDynamoDBStoreTests();
  });
}

export default storeTests;
