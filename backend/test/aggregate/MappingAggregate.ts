// tslint:disable:no-unused-expression
import { expect } from "chai";
import "mocha";

import { MappingAggregate, GetMapping } from "../../src";
import { TestBackendDataGenerator } from "../util/TestBackendDataGenerator";
import { New } from "hyperdoc-eventstore";

const testExecutionContext = TestBackendDataGenerator.randomExecutionContext();

function mappingAggregateTests() {
  describe("MappingAggregate", () => {
    it("should not get a non-existing mapping", (done) => {
      const mappingAggregate = new MappingAggregate(
        TestBackendDataGenerator.randomUUID(),
        testExecutionContext.aggregate.config
      );

      mappingAggregate
        .rehydrate()
        .then((mappingState) => {
          expect(mappingState).to.exist;
          expect(mappingState.$state).to.equal(New.NAME);

          return mappingAggregate.handle(new GetMapping());
        })
        .then((mappingState) => {
          expect(mappingState).to.exist;
          expect(mappingState.$state).to.equal(New.NAME);
        })
        .then(done)
        .catch(done);
    });

    // it("should get an existing mapping", (done) => {
    //   const testMapping = TestBackendDataGenerator.randomMapping();

    //   // add mapping to store so it can be fetched by the service
    //   testExecutionContext.stores.mappings
    //     .save(testMapping)
    //     .then((mapping) => {
    //       return MappingAggregate.get(testExecutionContext, testMapping.uuid);
    //     })
    //     .then((mapping) => {
    //       expect(mapping).to.exist;
    //     })
    //     .then(done);
    // });

    // it("should create a valid mapping", (done) => {
    //   const testMappingName = TestBackendDataGenerator.randomMappingName();
    //   const testMappingProperties = TestBackendDataGenerator.randomMappingProperties();

    //   MappingAggregate.create(testExecutionContext, testMappingName, testMappingProperties)
    //     .then((mapping) => {
    //       expect(mapping).to.exist;

    //       // check UUID
    //       expect(mapping.uuid).to.exist;

    //       // check mapping
    //       expect(mapping.name).to.equal(testMappingName);

    //       // check properties
    //       expect(mapping.properties).to.eql(testMappingProperties);
    //     })
    //     .then(done);
    // });
  });
}

export default mappingAggregateTests;
