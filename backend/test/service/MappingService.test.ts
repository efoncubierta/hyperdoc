// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// hyperdoc-backend dependencies
import { MappingService } from "../../src";

// test dependencies
import { TestBackendDataGenerator } from "../util/TestBackendDataGenerator";

const testExecutionContext = TestBackendDataGenerator.randomExecutionContext();

function mappingServiceTests() {
  describe("MappingService", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);
    });

    it("should not get a non-existing mapping", (done) => {
      MappingService.get(testExecutionContext, TestBackendDataGenerator.randomUUID())
        .then((mapping) => {
          chai.should().not.exist(mapping);
        })
        .then(done);
    });

    it("should go through the life cycle", (done) => {
      const mappingName = TestBackendDataGenerator.randomMappingName();
      const mappingProperties = TestBackendDataGenerator.randomMappingProperties();
      const mappingPropertiesUpdate = TestBackendDataGenerator.randomMappingProperties();

      MappingService.create(testExecutionContext, mappingName, mappingProperties)
        .then((mapping) => {
          chai.should().exist(mapping);

          // check UUID
          mapping.uuid.should.exist;

          // check mapping
          mapping.name.should.equal(mappingName);

          // check properties
          mapping.properties.should.eql(mappingProperties);

          return MappingService.get(testExecutionContext, mapping.uuid);
        })
        .then((mapping) => {
          chai.should().exist(mapping);

          // check UUID
          mapping.uuid.should.exist;

          // check mapping
          mapping.name.should.equal(mappingName);

          // check properties
          mapping.properties.should.eql(mappingProperties);

          return MappingService.setProperties(testExecutionContext, mapping.uuid, mappingPropertiesUpdate);
        })
        .then((mapping) => {
          chai.should().exist(mapping);

          // check UUID
          mapping.uuid.should.exist;

          // check mapping
          mapping.name.should.equal(mappingName);

          // check properties
          mapping.properties.should.eql(mappingPropertiesUpdate);
        })
        .then(done);
    });
  });
}

export default mappingServiceTests;
