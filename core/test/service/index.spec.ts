import "mocha";

import mappingServiceTests from "./MappingService";
import nodeServiceTests from "./NodeService";

describe("Service", () => {
  mappingServiceTests();
  nodeServiceTests();
});
