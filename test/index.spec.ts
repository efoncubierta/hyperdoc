// external dependencies
import "mocha";
import { Eventum, EventumProvider } from "eventum-sdk";

// test suites
import graphqlTests from "./graphql";
import aggregateTests from "./aggregate";
import materializerTests from "./materializer";
import ioTests from "./io";
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

  graphqlTests();
  aggregateTests();
  materializerTests();
  ioTests();
  storeTests();
  validationTests();
});
