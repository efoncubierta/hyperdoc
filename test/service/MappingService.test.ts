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

    it("should not get a non-existing mapping", () => {
      return MappingService.get(testExecutionContext, TestDataGenerator.randomUUID()).then((mappingOpt) => {
        chai.should().exist(mappingOpt);
        mappingOpt.isNone().should.be.true;
      });
    });

    it.skip("should go through the life cycle", () => {
      const mappingName = TestDataGenerator.randomMappingName();
      const mappingProperties = TestDataGenerator.randomMappingProperties();
      const mappingPropertiesUpdate = TestDataGenerator.randomMappingProperties();

      return MappingService.create(testExecutionContext, mappingName, mappingProperties)
        .then((mapping) => {
          chai.should().exist(mapping);

          // check UUID
          mapping.id.should.exist;

          // check mapping
          mapping.name.should.equal(mappingName);

          // check properties
          mapping.properties.should.eql(mappingProperties);

          return MappingService.get(testExecutionContext, mapping.id);
        })
        .then((mappingOpt) => {
          chai.should().exist(mappingOpt);
          mappingOpt.isSome().should.be.true;

          const m = mappingOpt.getOrElse(null);
          chai.should().exist(m);

          // check UUID
          m.id.should.exist;

          // check mapping
          m.name.should.equal(mappingName);

          // check properties
          m.properties.should.eql(mappingProperties);

          return MappingService.setProperties(testExecutionContext, m.id, mappingPropertiesUpdate);
        })
        .then((mapping) => {
          chai.should().exist(mapping);

          // check UUID
          mapping.id.should.exist;

          // check mapping
          mapping.name.should.equal(mappingName);

          // check properties
          mapping.properties.should.eql(mappingPropertiesUpdate);
        });
    });
  });
}

export default mappingServiceTests;
