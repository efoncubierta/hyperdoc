import "mocha";

// test suites
import awsStoreTests from "./aws";

function storeTests() {
  describe("Store", () => {
    awsStoreTests();
  });
}

export default storeTests;
