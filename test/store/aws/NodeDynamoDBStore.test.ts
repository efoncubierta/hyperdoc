// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// Hyperdoc dependencies
import { NodeStore } from "../../../src/store/NodeStore";
import { NodeDynamoDBStore } from "../../../src/store/aws/NodeDynamoDBStore";

// test dependencies
import { TestDataGenerator } from "../../util/TestDataGenerator";
import { AWSMock } from "../../mock/aws";
import { InMemoryNodeStore } from "../../mock/InMemoryNodeStore";

const testExecutionContext = TestDataGenerator.randomExecutionContext();

let nodeStore: NodeStore;

function nodeServiceTests() {
  describe("NodeDynamoDBStore", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);

      AWSMock.enableMock();

      nodeStore = new NodeDynamoDBStore();
    });

    beforeEach(() => {
      // clean up nodes in-memory before each test
      InMemoryNodeStore.reset();
    });

    after(() => {
      AWSMock.restoreMock();
    });

    it("get() should resolve to None for a random NodeId", () => {
      const nodeId = TestDataGenerator.randomNodeId();

      return nodeStore.get(nodeId).then((nodeOpt) => {
        chai.should().exist(nodeOpt);
        nodeOpt.isNone().should.be.true;
      });
    });

    it("get() should resolve to Some for an existing node", () => {
      const node = TestDataGenerator.randomNode();

      return nodeStore
        .put(node)
        .then(() => {
          return nodeStore.get(node.nodeId);
        })
        .then((nodeOpt) => {
          chai.should().exist(nodeOpt);
          nodeOpt.isSome().should.be.true;

          const n = nodeOpt.getOrElse(null);
          chai.should().exist(n);

          n.should.eql(node);
        });
    });

    it("delete() should be idempotent for a random node", () => {
      const nodeId = TestDataGenerator.randomNodeId();

      return nodeStore.delete(nodeId).should.not.be.rejected;
    });

    it("delete() should delete an existing node", () => {
      const node = TestDataGenerator.randomNode();

      return nodeStore
        .put(node)
        .then(() => {
          return nodeStore.get(node.nodeId);
        })
        .then((nodeOpt) => {
          chai.should().exist(nodeOpt);
          nodeOpt.isSome().should.be.true;

          const n = nodeOpt.getOrElse(null);
          chai.should().exist(n);

          n.should.eql(node);

          return nodeStore.delete(node.nodeId);
        })
        .then(() => {
          return nodeStore.get(node.nodeId);
        })
        .then((nodeOpt) => {
          chai.should().exist(nodeOpt);
          nodeOpt.isNone().should.be.true;
        });
    });
  });
}

export default nodeServiceTests;
