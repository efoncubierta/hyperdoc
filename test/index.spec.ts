// external dependencies
import "mocha";
import { Eventum, EventumProvider } from "eventum-sdk";

// test suites
import graphqlTests from "./graphql";
import aggregateTests from "./aggregate";
import serviceTests from "./service";
import validationTests from "./validation";

describe("Hyperdoc", () => {
  before(() => {
    Eventum.config({
      provider: EventumProvider.INMEMORY,
      stage: "test"
    });
  });

  after(() => {
    Eventum.resetConfig();
  });

  aggregateTests();
  serviceTests();
  validationTests();
});
