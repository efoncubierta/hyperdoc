import "mocha";

// test suites
import mappingDynamoDBStoreTests from "./MappingDynamoDBStore.test";
import nodeDynamoDBStoreTests from "./NodeDynamoDBStore.test";

function storeTests() {
  describe("AWS", () => {
    mappingDynamoDBStoreTests();
    nodeDynamoDBStoreTests();
  });
}

export default storeTests;
