// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// Hyperdoc dependencies
import { MappingStateName } from "../../src/model/Mapping";
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
      const mappingId = TestDataGenerator.randomMappingId();
      const mappingName = TestDataGenerator.randomMappingName();
      const mappingProperties = TestDataGenerator.randomMappingProperties();

      return MappingAggregate.build(mappingId).then((mappingAggregate) => {
        return mappingAggregate.create(mappingName, mappingProperties).then((mappingState) => {
          mappingState.should.exist;
          mappingState.name.should.be.equal(MappingStateName.Enabled);

          // can't call create for a second time
          return mappingAggregate.create(mappingName, mappingProperties).should.be.rejected;
        });
      });
    });

    it("create() should be rejected on a deleted mapping", () => {
      const mappingId = TestDataGenerator.randomMappingId();
      const mappingName = TestDataGenerator.randomMappingName();
      const mappignProperties = TestDataGenerator.randomMappingProperties();

      return MappingAggregate.build(mappingId).then((mappingAggregate) => {
        return mappingAggregate
          .create(mappingName, mappignProperties)
          .then((mappingState) => {
            mappingState.should.exist;
            mappingState.name.should.be.equal(MappingStateName.Enabled);

            return mappingAggregate.delete();
          })
          .then((mappingState) => {
            mappingState.should.exist;
            mappingState.name.should.be.equal(MappingStateName.Deleted);

            return mappingAggregate.create(mappingName, mappignProperties).should.be.rejected;
          });
      });
    });

    it("setProperties() should be rejected on a new mapping", () => {
      const mappingId = TestDataGenerator.randomMappingId();
      const mappingName = TestDataGenerator.randomMappingName();
      const mappingProperties = TestDataGenerator.randomMappingProperties();

      return MappingAggregate.build(mappingId).then((mappingAggregate) => {
        const initialState = mappingAggregate.get();
        initialState.should.exist;
        initialState.name.should.be.equal(MappingStateName.New);

        return mappingAggregate.setProperties(mappingProperties).should.be.rejected;
      });
    });

    it("setProperties() should be rejected on a deleted node", () => {
      const mappingId = TestDataGenerator.randomMappingId();
      const mappingName = TestDataGenerator.randomMappingName();
      const mappingProperties = TestDataGenerator.randomMappingProperties();

      return MappingAggregate.build(mappingId).then((mappingAggregate) => {
        return mappingAggregate
          .create(mappingName, mappingProperties)
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
      const nodeId = TestDataGenerator.randomMappingId();

      return MappingAggregate.build(nodeId).then((mappingAggregate) => {
        const initialState = mappingAggregate.get();
        initialState.should.exist;
        initialState.name.should.be.equal(MappingStateName.New);

        return mappingAggregate.delete().should.be.rejected;
      });
    });
  });
}

export default mappingAggregateTests;
