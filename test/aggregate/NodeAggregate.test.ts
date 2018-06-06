// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// models
import { Node, NodeStateName } from "../../src/model/Node";

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

    it("create() should be rejected on an existing node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate.create(mappingName, nodeProperties).then((nodeState) => {
          nodeState.should.exist;
          nodeState.name.should.be.equal(NodeStateName.Enabled);

          // can't call create for a second time
          return nodeAggregate.create(mappingName, nodeProperties).should.be.rejected;
        });
      });
    });

    it("create() should be rejected on a deleted node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.delete();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Deleted);

            return nodeAggregate.create(mappingName, nodeProperties).should.be.rejected;
          });
      });
    });

    it("setProperties() should be rejected on a new node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        const initialState = nodeAggregate.get();
        initialState.should.exist;
        initialState.name.should.be.equal(NodeStateName.New);

        return nodeAggregate.setProperties(nodeProperties).should.be.rejected;
      });
    });

    it("setProperties() should be rejected on a locked node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.lock();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Locked);

            return nodeAggregate.setProperties(nodeProperties).should.be.rejected;
          });
      });
    });

    it("setProperties() should be rejected on a disabled node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.disable("disabled reason");
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Disabled);

            return nodeAggregate.setProperties(nodeProperties).should.be.rejected;
          });
      });
    });

    it("setProperties() should be rejected on a deleted node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.delete();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Deleted);

            return nodeAggregate.setProperties(nodeProperties).should.be.rejected;
          });
      });
    });

    it("disable()/enable() should disable and enable an existing node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.disable("disabled reason");
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Disabled);

            return nodeAggregate.enable();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);
          });
      });
    });

    it("disable() should be rejected on a new node", () => {
      const aggregateId = TestDataGenerator.randomUUID();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        const initialState = nodeAggregate.get();
        initialState.should.exist;
        initialState.name.should.be.equal(NodeStateName.New);

        return nodeAggregate.disable("disable reason").should.be.rejected;
      });
    });

    it("disable() should be rejected on a locked node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.lock();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Locked);

            return nodeAggregate.disable("disabled reason").should.be.rejected;
          });
      });
    });

    it("disable() should be rejected on a deleted node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.delete();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Deleted);

            return nodeAggregate.disable("disabled reason").should.be.rejected;
          });
      });
    });

    it("disable() should be idempotent on a disabled node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.disable("bla bla");
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Disabled);

            return nodeAggregate.disable("disabled reason");
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Disabled);
          });
      });
    });

    it("enable() should be rejected on a new node", () => {
      const aggregateId = TestDataGenerator.randomUUID();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        const initialState = nodeAggregate.get();
        initialState.should.exist;
        initialState.name.should.be.equal(NodeStateName.New);

        return nodeAggregate.enable().should.be.rejected;
      });
    });

    it("enable() should be idempotent on a enabled node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.enable();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);
          });
      });
    });

    it("enable() should be rejected on a locked node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.lock();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Locked);

            return nodeAggregate.enable().should.be.rejected;
          });
      });
    });

    it("lock()/unlock() should lock and unlock an existing node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.lock();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Locked);

            return nodeAggregate.unlock();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);
          });
      });
    });

    it("lock() should be rejected on a new node", () => {
      const aggregateId = TestDataGenerator.randomUUID();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        const initialState = nodeAggregate.get();
        initialState.should.exist;
        initialState.name.should.be.equal(NodeStateName.New);

        return nodeAggregate.lock().should.be.rejected;
      });
    });

    it("lock() should be rejected on a deleted node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.delete();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Deleted);

            return nodeAggregate.lock().should.be.rejected;
          });
      });
    });

    it("lock() should be idempotent on a locked node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.lock();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Locked);

            return nodeAggregate.lock();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Locked);
          });
      });
    });

    it("unlock() should be idempotent on a enabled/disabled node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.unlock();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.disable("bla bla");
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Disabled);

            return nodeAggregate.unlock();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Disabled);
          });
      });
    });

    it("unlock() should be rejected on a new node", () => {
      const aggregateId = TestDataGenerator.randomUUID();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        const initialState = nodeAggregate.get();
        initialState.should.exist;
        initialState.name.should.be.equal(NodeStateName.New);

        return nodeAggregate.unlock().should.be.rejected;
      });
    });

    it("unlock() should be rejected on a deleted node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.delete();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Deleted);

            return nodeAggregate.unlock().should.be.rejected;
          });
      });
    });

    it("delete() should resolve on a disabled node", () => {
      const nodeId = TestDataGenerator.randomNodeId();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(nodeId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.disable("bla bla");
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Disabled);

            return nodeAggregate.delete();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Deleted);
          });
      });
    });

    it("delete() should be rejected on a new node", () => {
      const aggregateId = TestDataGenerator.randomUUID();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        const initialState = nodeAggregate.get();
        initialState.should.exist;
        initialState.name.should.be.equal(NodeStateName.New);

        return nodeAggregate.delete().should.be.rejected;
      });
    });

    it("delete() should be rejected on a locked node", () => {
      const aggregateId = TestDataGenerator.randomUUID();
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();

      return NodeAggregate.build(aggregateId).then((nodeAggregate) => {
        return nodeAggregate
          .create(mappingName, nodeProperties)
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Enabled);

            return nodeAggregate.lock();
          })
          .then((nodeState) => {
            nodeState.should.exist;
            nodeState.name.should.be.equal(NodeStateName.Locked);

            return nodeAggregate.delete().should.be.rejected;
          });
      });
    });
  });
}

export default nodeAggregateTests;
