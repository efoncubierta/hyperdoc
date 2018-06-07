import "mocha";

// test suites
import contentModelMaterializerTests from "./ContentModelMaterializer.test";

function materializerTests() {
  describe("Materializer", () => {
    contentModelMaterializerTests();
  });
}

export default materializerTests;
