// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// Hyperdoc dependencies
import { MappingStateName, MappingStrictnessLevel } from "../../src/model/Mapping";
import { MappingAggregate } from "../../src/aggregate/MappingAggregate";

// test dependencies
import { TestDataGenerator } from "../util/TestDataGenerator";

function mappingAggregateTests() {
  describe("MappingAggregate", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);
    });

    it("create() should be rejected on an existing mapping", () => {
      const context = TestDataGenerator.randomExecutionContext();
      const mappingId = TestDataGenerator.randomMappingId();
      const mappingName = TestDataGenerator.randomMappingName();
      const mappingStrictness = TestDataGenerator.randomMappingStrictnessLevel();
      const mappingProperties = TestDataGenerator.randomMappingProperties();

      return MappingAggregate.build(context, mappingId).then((mappingAggregate) => {
        return mappingAggregate.create(mappingName, mappingStrictness, mappingProperties).then((mappingState) => {
          mappingState.should.exist;
          mappingState.name.should.be.equal(MappingStateName.Enabled);

          // can't call create for a second time
          return mappingAggregate.create(mappingName, mappingStrictness, mappingProperties).should.be.rejected;
        });
      });
    });

    it("create() should be rejected on a deleted mapping", () => {
      const context = TestDataGenerator.randomExecutionContext();
      const mappingId = TestDataGenerator.randomMappingId();
      const mappingName = TestDataGenerator.randomMappingName();
      const mappingStrictness = TestDataGenerator.randomMappingStrictnessLevel();
      const mappignProperties = TestDataGenerator.randomMappingProperties();

      return MappingAggregate.build(context, mappingId).then((mappingAggregate) => {
        return mappingAggregate
          .create(mappingName, mappingStrictness, mappignProperties)
          .then((mappingState) => {
            mappingState.should.exist;
            mappingState.name.should.be.equal(MappingStateName.Enabled);

            return mappingAggregate.delete();
          })
          .then((mappingState) => {
            mappingState.should.exist;
            mappingState.name.should.be.equal(MappingStateName.Deleted);

            return mappingAggregate.create(mappingName, mappingStrictness, mappignProperties).should.be.rejected;
          });
      });
    });

    it("setProperties() should be rejected on a new mapping", () => {
      const context = TestDataGenerator.randomExecutionContext();
      const mappingId = TestDataGenerator.randomMappingId();
      const mappingProperties = TestDataGenerator.randomMappingProperties();

      return MappingAggregate.build(context, mappingId).then((mappingAggregate) => {
        const initialState = mappingAggregate.get();
        initialState.should.exist;
        initialState.name.should.be.equal(MappingStateName.New);

        return mappingAggregate.setProperties(mappingProperties).should.be.rejected;
      });
    });

    it("setProperties() should be rejected on a deleted node", () => {
      const context = TestDataGenerator.randomExecutionContext();
      const mappingId = TestDataGenerator.randomMappingId();
      const mappingName = TestDataGenerator.randomMappingName();
      const mappingStrictness = TestDataGenerator.randomMappingStrictnessLevel();
      const mappingProperties = TestDataGenerator.randomMappingProperties();

      return MappingAggregate.build(context, mappingId).then((mappingAggregate) => {
        return mappingAggregate
          .create(mappingName, mappingStrictness, mappingProperties)
          .then((mappingState) => {
            mappingState.should.exist;
            mappingState.name.should.be.equal(MappingStateName.Enabled);

            return mappingAggregate.delete();
          })
          .then((mappingState) => {
            mappingState.should.exist;
            mappingState.name.should.be.equal(MappingStateName.Deleted);

            return mappingAggregate.setProperties(mappingProperties).should.be.rejected;
          });
      });
    });

    it("delete() should be rejected on a new mapping", () => {
      const context = TestDataGenerator.randomExecutionContext();
      const nodeId = TestDataGenerator.randomMappingId();

      return MappingAggregate.build(context, nodeId).then((mappingAggregate) => {
        const initialState = mappingAggregate.get();
        initialState.should.exist;
        initialState.name.should.be.equal(MappingStateName.New);

        return mappingAggregate.delete().should.be.rejected;
      });
    });
  });
}

export default mappingAggregateTests;
