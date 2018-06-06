// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// models
import { Mapping, MappingStateName } from "../../src/model/Mapping";

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

    it("should go through the life cycle", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const mappingProperties = TestDataGenerator.randomMappingProperties();

      return MappingAggregate.build(aggregateId).then((mappingAggregate) => {
        const initialState = mappingAggregate.get();
        initialState.should.exist;
        initialState.name.should.equal(MappingStateName.New);

        return mappingAggregate
          .create(mappingName, mappingProperties)
          .then((mappingState) => {
            mappingState.should.exist;
            mappingState.name.should.be.equal(MappingStateName.Enabled);

            const mapping = mappingState.mapping;

            mapping.mappingId.should.exist;
            mapping.mappingId.should.be.equal(aggregateId);
            mapping.properties.should.exist;
            mapping.properties.should.be.eql(mappingProperties);

            // double check it is active
            mappingAggregate.get().name.should.equal(MappingStateName.Enabled);

            return mappingAggregate.delete();
          })
          .then((mappingState) => {
            mappingState.should.exist;
            mappingState.name.should.be.equal(MappingStateName.Deleted);
          });
      });
    });

    it("should reject a delete command on a new mapping", () => {
      const aggregateId = TestDataGenerator.randomUUID();

      return MappingAggregate.build(aggregateId).then((mappingAggregate) => {
        const initialState = mappingAggregate.get();
        initialState.should.exist;
        initialState.name.should.be.equal(MappingStateName.New);

        return mappingAggregate.delete().should.be.rejected;
      });
    });

    it("should rehydrate from data store", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const mappingProperties = TestDataGenerator.randomMappingProperties();
      const mappingProperties2 = TestDataGenerator.randomMappingProperties();

      return MappingAggregate.build(aggregateId).then((mappingAggregate) => {
        return mappingAggregate
          .create(mappingName, mappingProperties)
          .then((mappingState) => {
            mappingState.should.exist;
            mappingState.name.should.be.equal(MappingStateName.Enabled);

            return mappingAggregate.setProperties(mappingProperties2);
          })
          .then((mappingState) => {
            mappingState.should.exist;
            mappingState.name.should.be.equal(MappingStateName.Enabled);

            // create new aggregate that should rehydrate
            return MappingAggregate.build(aggregateId);
          })
          .then((mappingAggregate2) => {
            chai.should().exist(mappingAggregate2);

            // rehydrated mapping must be active
            const mappingState = mappingAggregate2.get();
            mappingState.name.should.be.equal(MappingStateName.Enabled);

            // validate rehydrated mapping
            const mapping = mappingState.mapping;
            mapping.mappingId.should.exist;
            mapping.mappingId.should.be.equal(aggregateId);
            mapping.properties.should.exist;
            mapping.properties.should.be.eql(mappingProperties2);
          });
      });
    });
  });
}

export default mappingAggregateTests;
