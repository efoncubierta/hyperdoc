// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// Hyperdoc readers
import { NodeReader } from "../../src/reader/NodeReader";

// Hyperdoc writers
import { NodeWriter } from "../../src/writer/NodeWriter";

// test dependencies
import { AWSMock } from "../mock/aws";
import { TestDataGenerator } from "../util/TestDataGenerator";
import { InMemoryNodeStore } from "../mock/InMemoryNodeStore";

const testExecutionContext = TestDataGenerator.randomExecutionContext();

function nodeServiceTests() {
  describe("NodeWriter/NodeReader", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);

      AWSMock.enableMock();
    });

    beforeEach(() => {
      InMemoryNodeStore.reset();
    });

    after(() => {
      AWSMock.restoreMock();
    });

    it("get() should resolve to None for a random NodeId", () => {
      const nodeId = TestDataGenerator.randomNodeId();
      return NodeReader.get(testExecutionContext, nodeId).then((nodeOpt) => {
        chai.should().exist(nodeOpt);
        nodeOpt.isNone().should.be.true;
      });
    });

    it("get() should resolve to Some for an existing node", () => {
      const node = TestDataGenerator.randomNode();

      InMemoryNodeStore.put(node);

      return NodeReader.get(testExecutionContext, node.nodeId).then((nodeOpt) => {
        chai.should().exist(nodeOpt);
        nodeOpt.isSome().should.be.true;

        const n = nodeOpt.getOrElse(null);
        chai.should().exist(n);

        n.should.eql(node);
      });
    });

    it("setProperties() should be rejected for random NodeId", () => {
      const nodeId = TestDataGenerator.randomNodeId();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeWriter.setProperties(testExecutionContext, nodeId, nodeProperties).should.be.rejected;
    });

    it("setProperties() should set properties to an existing node", () => {
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();
      const nodeProperties2 = TestDataGenerator.randomNodeProperties();

      let nodeId;
      return NodeWriter.create(testExecutionContext, mappingName, nodeProperties)
        .then((node) => {
          chai.should().exist(node);

          // set nodeId for testing
          nodeId = node.nodeId;

          node.mappingName.should.equal(mappingName);
          node.properties.should.eql(nodeProperties);

          // update in-memory store to facilite the new node to NodeService.get()
          InMemoryNodeStore.put(node);

          return NodeWriter.setProperties(testExecutionContext, nodeId, nodeProperties2);
        })
        .then((node) => {
          chai.should().exist(node);

          // set nodeId for testing
          nodeId = node.nodeId;

          node.mappingName.should.equal(mappingName);
          node.properties.should.eql(nodeProperties2);
        });
    });

    it("exist() should resolve to false for a random NodeId", () => {
      const nodeId = TestDataGenerator.randomNodeId();

      return NodeReader.exists(testExecutionContext, nodeId).then((exist) => {
        exist.should.be.false;
      });
    });

    it("exist() should resolve to true for an enabled/disabled/locked node. False otherwise", () => {
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      let nodeId;
      return NodeWriter.create(testExecutionContext, mappingName, nodeProperties)
        .then((node) => {
          chai.should().exist(node);

          // set nodeId for testing
          nodeId = node.nodeId;

          node.mappingName.should.equal(mappingName);
          node.properties.should.eql(nodeProperties);

          return NodeReader.exists(testExecutionContext, nodeId);
        })
        .then((exist) => {
          // a new node should exist
          chai.should().exist(exist);
          exist.should.be.true;

          return NodeWriter.disable(testExecutionContext, nodeId, "bla bla");
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeReader.exists(testExecutionContext, nodeId);
        })
        .then((exist) => {
          // a disabled node should exist
          chai.should().exist(exist);
          exist.should.be.true;

          return NodeWriter.lock(testExecutionContext, nodeId);
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeReader.exists(testExecutionContext, nodeId);
        })
        .then((exist) => {
          // a locked node should exist
          chai.should().exist(exist);
          exist.should.be.true;

          return NodeWriter.unlock(testExecutionContext, nodeId);
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeWriter.delete(testExecutionContext, nodeId);
        })
        .then((node) => {
          chai.should().not.exist(node);

          return NodeReader.exists(testExecutionContext, nodeId);
        })
        .then((exist) => {
          // a deleted node should not exist
          chai.should().exist(exist);
          exist.should.be.false;

          return NodeReader.exists(testExecutionContext, nodeId);
        });
    });

    it("isDisabled() should resolve to false for random NodeId", () => {
      const nodeId = TestDataGenerator.randomNodeId();

      return NodeReader.isDisabled(testExecutionContext, nodeId).then((disabled) => {
        disabled.should.be.false;
      });
    });

    it("isDisabled() should resolve to true for a disabled node. False otherwise", () => {
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      let nodeId;

      return NodeWriter.create(testExecutionContext, mappingName, nodeProperties)
        .then((node) => {
          chai.should().exist(node);

          // set nodeId for testing
          nodeId = node.nodeId;

          node.mappingName.should.equal(mappingName);
          node.properties.should.eql(nodeProperties);

          return NodeReader.isDisabled(testExecutionContext, nodeId);
        })
        .then((disabled) => {
          // new node should not be disabled
          chai.should().exist(disabled);
          disabled.should.be.false;

          return NodeWriter.disable(testExecutionContext, nodeId, "bla bla");
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeReader.isDisabled(testExecutionContext, nodeId);
        })
        .then((disabled) => {
          // a disabled node should be disabled
          chai.should().exist(disabled);
          disabled.should.be.true;

          return NodeWriter.lock(testExecutionContext, nodeId);
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeReader.isDisabled(testExecutionContext, nodeId);
        })
        .then((disabled) => {
          // a locked node should not be disabled
          chai.should().exist(disabled);
          disabled.should.be.false;

          return NodeWriter.unlock(testExecutionContext, nodeId);
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeWriter.delete(testExecutionContext, nodeId);
        })
        .then((node) => {
          chai.should().not.exist(node);

          return NodeReader.isDisabled(testExecutionContext, nodeId);
        })
        .then((disabled) => {
          // a deleted node should not be disabled
          chai.should().exist(disabled);
          disabled.should.be.false;
        });
    });

    it("isEnabled() should resolve to false for random NodeId", () => {
      const nodeId = TestDataGenerator.randomNodeId();

      return NodeReader.isEnabled(testExecutionContext, nodeId).then((enabled) => {
        enabled.should.be.false;
      });
    });

    it("isEnabled() should resolve to true for an enabled node. False otherwise", () => {
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      let nodeId;

      return NodeWriter.create(testExecutionContext, mappingName, nodeProperties)
        .then((node) => {
          chai.should().exist(node);

          // set nodeId for testing
          nodeId = node.nodeId;

          node.mappingName.should.equal(mappingName);
          node.properties.should.eql(nodeProperties);

          return NodeReader.isEnabled(testExecutionContext, nodeId);
        })
        .then((enabled) => {
          // new node should be enabled
          chai.should().exist(enabled);
          enabled.should.be.true;

          return NodeWriter.disable(testExecutionContext, nodeId, "bla bla");
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeReader.isEnabled(testExecutionContext, nodeId);
        })
        .then((enabled) => {
          // a disabled node should not be enabled
          chai.should().exist(enabled);
          enabled.should.be.false;

          return NodeWriter.enable(testExecutionContext, nodeId);
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeReader.isEnabled(testExecutionContext, nodeId);
        })
        .then((enabled) => {
          // a enabled node should be be enabled
          chai.should().exist(enabled);
          enabled.should.be.true;

          return NodeWriter.lock(testExecutionContext, nodeId);
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeReader.isEnabled(testExecutionContext, nodeId);
        })
        .then((enabled) => {
          // a locked node should be not be enabled
          chai.should().exist(enabled);
          enabled.should.be.false;

          return NodeWriter.unlock(testExecutionContext, nodeId);
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeWriter.delete(testExecutionContext, nodeId);
        })
        .then((node) => {
          chai.should().not.exist(node);

          return NodeReader.isEnabled(testExecutionContext, nodeId);
        })
        .then((enabled) => {
          // a deleted node should not be enabled
          chai.should().exist(enabled);
          enabled.should.be.false;
        });
    });

    it("isLocked() should resolve to false for random NodeId", () => {
      const nodeId = TestDataGenerator.randomNodeId();

      return NodeReader.isLocked(testExecutionContext, nodeId).then((locked) => {
        locked.should.be.false;
      });
    });

    it("isLocked() should resolve to true for a locked node. False otherwise", () => {
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      let nodeId;

      return NodeWriter.create(testExecutionContext, mappingName, nodeProperties)
        .then((node) => {
          chai.should().exist(node);

          // set nodeId for testing
          nodeId = node.nodeId;

          node.mappingName.should.equal(mappingName);
          node.properties.should.eql(nodeProperties);

          return NodeReader.isLocked(testExecutionContext, nodeId);
        })
        .then((locked) => {
          // new node should not be locked
          chai.should().exist(locked);
          locked.should.be.false;

          return NodeWriter.disable(testExecutionContext, nodeId, "bla bla");
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeReader.isLocked(testExecutionContext, nodeId);
        })
        .then((locked) => {
          // a disabled node should not be locked
          chai.should().exist(locked);
          locked.should.be.false;

          return NodeWriter.lock(testExecutionContext, nodeId);
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeReader.isLocked(testExecutionContext, nodeId);
        })
        .then((locked) => {
          // a locked node should be locked
          chai.should().exist(locked);
          locked.should.be.true;
        });
    });

    it("isUnlocked() should resolve to false for random NodeId", () => {
      const nodeId = TestDataGenerator.randomNodeId();

      return NodeReader.isUnlocked(testExecutionContext, nodeId).then((unlocked) => {
        unlocked.should.be.false;
      });
    });

    it("isUnlocked() should resolve to true for an enabled/disabled node. False otherwise", () => {
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      let nodeId;

      return NodeWriter.create(testExecutionContext, mappingName, nodeProperties)
        .then((node) => {
          chai.should().exist(node);

          // set nodeId for testing
          nodeId = node.nodeId;

          node.mappingName.should.equal(mappingName);
          node.properties.should.eql(nodeProperties);

          return NodeReader.isUnlocked(testExecutionContext, nodeId);
        })
        .then((unlocked) => {
          // new node should be unlocked
          chai.should().exist(unlocked);
          unlocked.should.be.true;

          return NodeWriter.disable(testExecutionContext, nodeId, "bla bla");
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeReader.isUnlocked(testExecutionContext, nodeId);
        })
        .then((unlocked) => {
          // a disabled node should be unlocked
          chai.should().exist(unlocked);
          unlocked.should.be.true;

          return NodeWriter.lock(testExecutionContext, nodeId);
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeReader.isUnlocked(testExecutionContext, nodeId);
        })
        .then((unlocked) => {
          // a locked node should not be unlocked
          chai.should().exist(unlocked);
          unlocked.should.be.false;

          return NodeWriter.unlock(testExecutionContext, nodeId);
        })
        .then((node) => {
          chai.should().exist(node);

          return NodeWriter.delete(testExecutionContext, nodeId);
        })
        .then((node) => {
          chai.should().not.exist(node);

          return NodeReader.isUnlocked(testExecutionContext, nodeId);
        })
        .then((unlocked) => {
          // a deleted node should not be unlocked
          chai.should().exist(unlocked);
          unlocked.should.be.false;
        });
    });
  });
}

export default nodeServiceTests;
