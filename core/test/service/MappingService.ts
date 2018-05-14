// tslint:disable:no-unused-expression
import { expect } from "chai";
import "mocha";

import MappingService from "../../src/service/MappingService";
import TestDataGenerator from "../util/TestDataGenerator";

const testExecutionContext = TestDataGenerator.randomExecutionContext();

function mappingServiceTests() {
  describe("MappingService", () => {
    it("should not get a non-existing mapping", (done) => {
      MappingService.get(testExecutionContext, TestDataGenerator.randomUUID())
        .then((mapping) => {
          expect(mapping).to.not.exist;
        })
        .then(done);
    });

    it("should get an existing mapping", (done) => {
      const testMapping = TestDataGenerator.randomMapping();

      // add mapping to store so it can be fetched by the service
      testExecutionContext.stores.mappings
        .save(testMapping)
        .then((mapping) => {
          return MappingService.get(testExecutionContext, testMapping.uuid);
        })
        .then((mapping) => {
          expect(mapping).to.exist;
        })
        .then(done);
    });

    it("should create a valid mapping", (done) => {
      const testMappingName = TestDataGenerator.randomMappingName();
      const testMappingProperties = TestDataGenerator.randomMappingProperties();

      MappingService.create(testExecutionContext, testMappingName, testMappingProperties)
        .then((mapping) => {
          expect(mapping).to.exist;

          // check UUID
          expect(mapping.uuid).to.exist;

          // check mapping
          expect(mapping.name).to.equal(testMappingName);

          // check properties
          expect(mapping.properties).to.eql(testMappingProperties);
        })
        .then(done);
    });
  });
}

export default mappingServiceTests;
