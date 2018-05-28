import "mocha";

// test suites

import mappingServiceTests from "./MappingService.test";
import nodeServiceTests from "./NodeService.test";

function serviceTests() {
  describe("Service", () => {
    mappingServiceTests();
    nodeServiceTests();
  });
}

export default serviceTests;
