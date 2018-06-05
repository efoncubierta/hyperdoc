// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// services
import { NodeService } from "../../src/service/NodeService";

// test dependencies
import { TestDataGenerator } from "../util/TestDataGenerator";
import { AWSMock } from "../mock/aws";

const testExecutionContext = TestDataGenerator.randomExecutionContext();

function nodeServiceTests() {
  describe("NodeService", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);

      AWSMock.enableMock();
    });

    after(() => {
      AWSMock.restoreMock();
    });

    it("should not get a non-existing node", () => {
      return NodeService.get(testExecutionContext, TestDataGenerator.randomUUID()).then((nodeOpt) => {
        chai.should().exist(nodeOpt);
        nodeOpt.isNone().should.be.true;
      });
    });

    it.skip("should go through the life cycle", () => {
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomNodeProperties();
      const nodePropertiesUpdate = TestDataGenerator.randomNodeProperties();

      return NodeService.create(testExecutionContext, mappingName, nodeProperties)
        .then((node) => {
          chai.should().exist(node);

          // check UUID
          node.id.should.exist;

          // check node
          node.mappingName.should.equal(mappingName);

          // check properties
          node.properties.should.eql(nodeProperties);

          return NodeService.get(testExecutionContext, node.id);
        })
        .then((nodeOpt) => {
          chai.should().exist(nodeOpt);

          const n = nodeOpt.getOrElse(null);
          chai.should().exist(n);

          // check UUID
          n.id.should.exist;

          // check node
          n.mappingName.should.equal(mappingName);

          // check properties
          n.properties.should.eql(nodeProperties);

          return NodeService.setProperties(testExecutionContext, n.id, nodePropertiesUpdate);
        })
        .then((node) => {
          chai.should().exist(node);

          // check UUID
          node.id.should.exist;

          // check node
          node.mappingName.should.equal(mappingName);

          // check properties
          node.properties.should.eql(nodePropertiesUpdate);
        });
    });
  });
}

export default nodeServiceTests;
