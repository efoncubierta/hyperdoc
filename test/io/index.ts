import "mocha";

// test suites

import mappingIOTests from "./MappingIO.test";
import nodeIOTests from "./NodeIO.test";

function ioTests() {
  describe("IO", () => {
    mappingIOTests();
    nodeIOTests();
  });
}

export default ioTests;
