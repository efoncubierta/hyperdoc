// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// services
import { MappingService } from "../../src/service/MappingService";

// test dependencies
import { TestDataGenerator } from "../util/TestDataGenerator";
import { AWSMock } from "../mock/aws";

const testExecutionContext = TestDataGenerator.randomExecutionContext();

function mappingServiceTests() {
  describe("MappingService", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);

      AWSMock.enableMock();
    });

    after(() => {
      AWSMock.restoreMock();
    });

    it("should not get a non-existing mapping", (done) => {
      MappingService.get(testExecutionContext, TestDataGenerator.randomUUID())
        .then((mapping) => {
          chai.should().not.exist(mapping);
        })
        .then(done);
    });

    it.skip("should go through the life cycle", (done) => {
      const mappingName = TestDataGenerator.randomMappingName();
      const mappingProperties = TestDataGenerator.randomMappingProperties();
      const mappingPropertiesUpdate = TestDataGenerator.randomMappingProperties();

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
        .then(done)
        .catch(done);
    });
  });
}

export default mappingServiceTests;
