// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// eventum-sdk dependencies
import { New, Active, Deleted, AggregateError } from "eventum-sdk";

// hyperdoc-core dependencies
import { Node } from "hyperdoc-core";

// hyperdoc-backend dependencies
import { NodeAggregate, GetNode } from "../../src";

// test dependencies
import { TestBackendDataGenerator } from "../util/TestBackendDataGenerator";

const testExecutionContext = TestBackendDataGenerator.randomExecutionContext();

function nodeAggregateTests() {
  describe("NodeAggregate", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);
    });

    it("should go through the life cycle", (done) => {
      const aggregateId = TestBackendDataGenerator.randomUUID();
      const createNode = TestBackendDataGenerator.randomCreateNode();
      const getNode = TestBackendDataGenerator.randomGetNode();
      const deleteNode = TestBackendDataGenerator.randomDeleteNode();

      NodeAggregate.build(aggregateId, testExecutionContext.aggregates.node)
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
      const aggregateId = TestBackendDataGenerator.randomUUID();
      const getNode = TestBackendDataGenerator.randomGetNode();
      const deleteEntity = TestBackendDataGenerator.randomDeleteNode();

      NodeAggregate.build(aggregateId, testExecutionContext.aggregates.node)
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
      const aggregateId = TestBackendDataGenerator.randomUUID();
      const createNode = TestBackendDataGenerator.randomCreateNode();
      const setNodeProperties = TestBackendDataGenerator.randomSetNodeProperties();
      const getNode = TestBackendDataGenerator.randomGetNode();
      const deleteNode = TestBackendDataGenerator.randomDeleteNode();

      NodeAggregate.build(aggregateId, testExecutionContext.aggregates.node)
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
              return NodeAggregate.build(aggregateId, testExecutionContext.aggregates.node);
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
      const aggregateId = TestBackendDataGenerator.randomUUID();
      const getNode = TestBackendDataGenerator.randomGetNode();
      const notSupportedCommand = TestBackendDataGenerator.randomNotSupportedCommand();

      NodeAggregate.build(aggregateId, testExecutionContext.aggregates.node)
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
