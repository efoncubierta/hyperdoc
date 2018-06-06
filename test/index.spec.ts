// external dependencies
import "mocha";
import { Eventum, EventumProvider } from "eventum-sdk";

// test suites
import graphqlTests from "./graphql";
import aggregateTests from "./aggregate";
import serviceTests from "./service";
import storeTests from "./store";
import validationTests from "./validation";
import { Hyperdoc } from "../src/Hyperdoc";

describe("Hyperdoc", () => {
  before(() => {
    Eventum.config({
      provider: EventumProvider.INMEMORY,
      stage: "test"
    });
    Hyperdoc.config({
      stage: "test",
      aws: {
        dynamodb: {
          mappings: {
            tableName: "hyperdoc-test-mappings"
          },
          nodes: {
            tableName: "hyperdoc-test-nodes"
          }
        }
      }
    });
  });

  after(() => {
    Eventum.resetConfig();
    Hyperdoc.resetConfig();
  });

  aggregateTests();
  serviceTests();
  storeTests();
  validationTests();
});
