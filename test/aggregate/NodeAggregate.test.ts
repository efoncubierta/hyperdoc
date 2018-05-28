// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// eventum-sdk dependencies
import { New, Active, Deleted, AggregateError } from "eventum-sdk";

// models
import { Node } from "../../src/model/Node";

// aggregates
import { NodeAggregate } from "../../src/aggregate/NodeAggregate";

// test dependencies
import { TestDataGenerator } from "../util/TestDataGenerator";

function nodeAggregateTests() {
  describe("NodeAggregate", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);
    });

    it("should go through the life cycle", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const createNode = TestDataGenerator.randomCreateNode();
      const getNode = TestDataGenerator.randomGetNode();
      const deleteNode = TestDataGenerator.randomDeleteNode();

      NodeAggregate.build(aggregateId)
        .then((nodeAggregate) => {
          nodeAggregate
            .handle(getNode)
            .then((nodeState) => {
              nodeState.should.exist;
              nodeState.stateName.should.be.equal(New.STATE_NAME);

              return nodeAggregate.handle(createNode);
            })
            .then((nodeState) => {
              nodeState.should.exist;
              nodeState.stateName.should.be.equal(Active.STATE_NAME);

              const node = (nodeState as Active<Node>).payload;

              node.uuid.should.exist;
              node.uuid.should.be.equal(aggregateId);
              node.properties.should.exist;
              node.properties.should.be.eql(createNode.properties);

              return nodeAggregate.handle(getNode);
            })
            .then((nodeState) => {
              nodeState.should.exist;
              nodeState.stateName.should.be.equal(Active.STATE_NAME);

              return nodeAggregate.handle(deleteNode);
            })
            .then((nodeState) => {
              nodeState.should.exist;
              nodeState.stateName.should.be.equal(Deleted.STATE_NAME);
              return;
            });
        })
        .then(done)
        .catch(done);
    });

    it("should reject a delete command on a new node", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const getNode = TestDataGenerator.randomGetNode();
      const deleteEntity = TestDataGenerator.randomDeleteNode();

      NodeAggregate.build(aggregateId)
        .then((nodeAggregate) => {
          nodeAggregate.handle(getNode).then((nodeState) => {
            nodeState.should.exist;
            nodeState.stateName.should.be.equal(New.STATE_NAME);

            nodeAggregate.handle(deleteEntity).should.be.rejected;
            done();
          });
        })
        .catch(done);
    });

    it("should rehydrate from data store", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const createNode = TestDataGenerator.randomCreateNode();
      const setNodeProperties = TestDataGenerator.randomSetNodeProperties();
      const getNode = TestDataGenerator.randomGetNode();
      const deleteNode = TestDataGenerator.randomDeleteNode();

      NodeAggregate.build(aggregateId)
        .then((nodeAggregate) => {
          nodeAggregate
            .handle(createNode)
            .then((nodeState) => {
              nodeState.should.exist;
              nodeState.stateName.should.be.equal(Active.STATE_NAME);

              return nodeAggregate.handle(setNodeProperties);
            })
            .then((nodeState) => {
              nodeState.should.exist;
              nodeState.stateName.should.be.equal(Active.STATE_NAME);

              // create new aggregate that should rehydrate
              return NodeAggregate.build(aggregateId);
            })
            .then((nodeAggregate2) => {
              chai.should().exist(nodeAggregate2);
              return nodeAggregate2.handle(getNode);
            })
            .then((nodeState) => {
              nodeState.should.exist;
              nodeState.stateName.should.be.equal(Active.STATE_NAME);

              // validate rehydrated node
              const node = (nodeState as Active<Node>).payload;
              node.uuid.should.exist;
              node.uuid.should.be.equal(aggregateId);
              node.properties.should.exist;
              node.properties.should.be.eql(setNodeProperties.properties);

              return;
            });
        })
        .then(done)
        .catch(done);
    });

    it("should reject a command that is not supported", (done) => {
      const aggregateId = TestDataGenerator.randomUUID();
      const getNode = TestDataGenerator.randomGetNode();
      const notSupportedCommand = TestDataGenerator.randomNotSupportedCommand();

      NodeAggregate.build(aggregateId)
        .then((nodeAggregate) => {
          nodeAggregate.handle(getNode).then((nodeState) => {
            nodeAggregate.handle(notSupportedCommand).should.be.rejected;
            done();
          });
        })
        .catch(done);
    });
  });
}

export default nodeAggregateTests;
