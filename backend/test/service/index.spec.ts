import * as path from "path";
import "mocha";

import { Eventum } from "eventum-sdk";

import mappingServiceTests from "./MappingService.test";
import nodeServiceTests from "./NodeService.test";

// configure eventum for testing
Eventum.setConfigFile(path.join(__dirname, "../eventum.yml"));

describe("Backend :: Service", () => {
  mappingServiceTests();
  nodeServiceTests();
});
