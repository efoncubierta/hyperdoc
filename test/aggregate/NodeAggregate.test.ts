// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// models
import { Node } from "../../src/model/Node";

// aggregates
import { NodeAggregate } from "../../src/aggregate/NodeAggregate";

// test dependencies
import { TestDataGenerator } from "../util/TestDataGenerator";
import { NodeStateName } from "../../src/aggregate/NodeStateName";

function nodeAggregateTests() {
  describe("NodeAggregate", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);
    });

    it("should go through the life cycle", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        const initialState = nodeAggregate.get();
        initialState.should.exist;
        initialState.stateName.should.equal(NodeStateName.New);

        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.stateName.should.be.equal(NodeStateName.Active);

            const node = nodeState.payload;

            node.uuid.should.exist;
            node.uuid.should.be.equal(aggregateId);
            node.properties.should.exist;
            node.properties.should.be.eql(nodeProperties);

            // double check it is active
            nodeAggregate.get().stateName.should.equal(NodeStateName.Active);

            return nodeAggregate.delete();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.stateName.should.be.equal(NodeStateName.Deleted);
          });
      });
    });

    it("should reject a delete command on a new node", () => {
      const aggregateId = TestDataGenerator.randomUUID();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        const initialState = nodeAggregate.get();
        initialState.should.exist;
        initialState.stateName.should.be.equal(NodeStateName.New);

        return nodeAggregate.delete().should.be.rejected;
      });
    });

    it("should rehydrate from data store", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();
      const nodeProperties2 = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.stateName.should.be.equal(NodeStateName.Active);

            return nodeAggregate.setProperties(nodeProperties2);
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.stateName.should.be.equal(NodeStateName.Active);

            // create new aggregate that should rehydrate
            return NodeAggregate.build(aggregateId);
          })
          .then((nodeAggregate2) => {
            chai.should().exist(nodeAggregate2);

            // rehydrated node must be active
            const nodeState = nodeAggregate2.get();
            nodeState.stateName.should.be.equal(NodeStateName.Active);

            // validate rehydrated node
            const node = nodeState.payload;
            node.uuid.should.exist;
            node.uuid.should.be.equal(aggregateId);
            node.properties.should.exist;
            node.properties.should.be.eql(nodeProperties2);
          });
      });
    });
  });
}

export default nodeAggregateTests;
