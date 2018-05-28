// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// eventum-sdk dependencies
import { New, Active, Deleted, AggregateError } from "eventum-sdk";

// models
import { Mapping } from "../../src/model/Mapping";

// aggregates
import { MappingAggregate } from "../../src/aggregate/MappingAggregate";

// test dependencies
import { TestDataGenerator } from "../util/TestDataGenerator";

function mappingAggregateTests() {
  describe("MappingAggregate", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);
    });

    it("should go through the life cycle", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const createMapping = TestDataGenerator.randomCreateMapping();
      const getMapping = TestDataGenerator.randomGetMapping();
      const deleteMapping = TestDataGenerator.randomDeleteMapping();

      MappingAggregate.build(aggregateId)
        .then((mappingAggregate) => {
          mappingAggregate
            .handle(getMapping)
            .then((mappingState) => {
              mappingState.should.exist;
              mappingState.stateName.should.be.equal(New.STATE_NAME);

              return mappingAggregate.handle(createMapping);
            })
            .then((mappingState) => {
              mappingState.should.exist;
              mappingState.stateName.should.be.equal(Active.STATE_NAME);

              const mapping = (mappingState as Active<Mapping>).payload;

              mapping.uuid.should.exist;
              mapping.uuid.should.be.equal(aggregateId);
              mapping.properties.should.exist;
              mapping.properties.should.be.eql(createMapping.properties);

              return mappingAggregate.handle(getMapping);
            })
            .then((mappingState) => {
              mappingState.should.exist;
              mappingState.stateName.should.be.equal(Active.STATE_NAME);

              return mappingAggregate.handle(deleteMapping);
            })
            .then((mappingState) => {
              mappingState.should.exist;
              mappingState.stateName.should.be.equal(Deleted.STATE_NAME);
              return;
            });
        })
        .then(done)
        .catch(done);
    });

    it("should reject a delete command on a new mapping", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const getMapping = TestDataGenerator.randomGetMapping();
      const deleteEntity = TestDataGenerator.randomDeleteMapping();

      MappingAggregate.build(aggregateId)
        .then((mappingAggregate) => {
          mappingAggregate.handle(getMapping).then((mappingState) => {
            mappingState.should.exist;
            mappingState.stateName.should.be.equal(New.STATE_NAME);

            mappingAggregate.handle(deleteEntity).should.be.rejected;
            done();
          });
        })
        .catch(done);
    });

    it("should rehydrate from data store", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const createMapping = TestDataGenerator.randomCreateMapping();
      const setMappingProperties = TestDataGenerator.randomSetMappingProperties();
      const getMapping = TestDataGenerator.randomGetMapping();
      const deleteMapping = TestDataGenerator.randomDeleteMapping();

      MappingAggregate.build(aggregateId)
        .then((mappingAggregate) => {
          mappingAggregate
            .handle(createMapping)
            .then((mappingState) => {
              mappingState.should.exist;
              mappingState.stateName.should.be.equal(Active.STATE_NAME);

              return mappingAggregate.handle(setMappingProperties);
            })
            .then((mappingState) => {
              mappingState.should.exist;
              mappingState.stateName.should.be.equal(Active.STATE_NAME);

              // create new aggregate that should rehydrate
              return MappingAggregate.build(aggregateId);
            })
            .then((mappingAggregate2) => {
              chai.should().exist(mappingAggregate2);
              return mappingAggregate2.handle(getMapping);
            })
            .then((mappingState) => {
              mappingState.should.exist;
              mappingState.stateName.should.be.equal(Active.STATE_NAME);

              // validate rehydrated mapping
              const mapping = (mappingState as Active<Mapping>).payload;
              mapping.uuid.should.exist;
              mapping.uuid.should.be.equal(aggregateId);
              mapping.properties.should.exist;
              mapping.properties.should.be.eql(setMappingProperties.properties);

              return;
            });
        })
        .then(done)
        .catch(done);
    });

    it("should reject a command that is not supported", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const getMapping = TestDataGenerator.randomGetMapping();
      const notSupportedCommand = TestDataGenerator.randomNotSupportedCommand();

      MappingAggregate.build(aggregateId)
        .then((mappingAggregate) => {
          mappingAggregate.handle(getMapping).then((mappingState) => {
            mappingAggregate.handle(notSupportedCommand).should.be.rejected;
            done();
          });
        })
        .catch(done);
    });
  });
}

export default mappingAggregateTests;
