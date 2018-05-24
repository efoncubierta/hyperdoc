// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// eventum-sdk dependencies
import { New, Active, Deleted, AggregateError } from "eventum-sdk";

// hyperdoc-core dependencies
import { Mapping } from "hyperdoc-core";

// hyperdoc-backend dependencies
import { MappingAggregate, GetMapping } from "../../src";

// test dependencies
import { TestBackendDataGenerator } from "../util/TestBackendDataGenerator";

const testExecutionContext = TestBackendDataGenerator.randomExecutionContext();

function mappingAggregateTests() {
  describe("MappingAggregate", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);
    });

    it("should go through the life cycle", (done) => {
      const aggregateId = TestBackendDataGenerator.randomUUID();
      const createMapping = TestBackendDataGenerator.randomCreateMapping();
      const getMapping = TestBackendDataGenerator.randomGetMapping();
      const deleteMapping = TestBackendDataGenerator.randomDeleteMapping();

      MappingAggregate.build(aggregateId, testExecutionContext.aggregates.mapping)
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
      const aggregateId = TestBackendDataGenerator.randomUUID();
      const getMapping = TestBackendDataGenerator.randomGetMapping();
      const deleteEntity = TestBackendDataGenerator.randomDeleteMapping();

      MappingAggregate.build(aggregateId, testExecutionContext.aggregates.mapping)
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
      const aggregateId = TestBackendDataGenerator.randomUUID();
      const createMapping = TestBackendDataGenerator.randomCreateMapping();
      const setMappingProperties = TestBackendDataGenerator.randomSetMappingProperties();
      const getMapping = TestBackendDataGenerator.randomGetMapping();
      const deleteMapping = TestBackendDataGenerator.randomDeleteMapping();

      MappingAggregate.build(aggregateId, testExecutionContext.aggregates.mapping)
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
              return MappingAggregate.build(aggregateId, testExecutionContext.aggregates.mapping);
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
      const aggregateId = TestBackendDataGenerator.randomUUID();
      const getMapping = TestBackendDataGenerator.randomGetMapping();
      const notSupportedCommand = TestBackendDataGenerator.randomNotSupportedCommand();

      MappingAggregate.build(aggregateId, testExecutionContext.aggregates.mapping)
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
