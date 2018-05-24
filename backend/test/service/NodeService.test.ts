// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// hyperdoc-backend dependencies
import { NodeService } from "../../src";

// test dependencies
import { TestBackendDataGenerator } from "../util/TestBackendDataGenerator";

const testExecutionContext = TestBackendDataGenerator.randomExecutionContext();

function nodeServiceTests() {
  describe("NodeService", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);
    });

    it("should not get a non-existing node", (done) => {
      NodeService.get(testExecutionContext, TestBackendDataGenerator.randomUUID())
        .then((node) => {
          chai.should().not.exist(node);
        })
        .then(done);
    });

    it("should go through the life cycle", (done) => {
      const mappingName = TestBackendDataGenerator.randomMappingName();
      const nodeProperties = TestBackendDataGenerator.randomNodeProperties();
      const nodePropertiesUpdate = TestBackendDataGenerator.randomNodeProperties();

      NodeService.create(testExecutionContext, mappingName, nodeProperties)
        .then((node) => {
          chai.should().exist(node);

          // check UUID
          node.uuid.should.exist;

          // check node
          node.mapping.should.equal(mappingName);

          // check properties
          node.properties.should.eql(nodeProperties);

          return NodeService.get(testExecutionContext, node.uuid);
        })
        .then((node) => {
          chai.should().exist(node);

          // check UUID
          node.uuid.should.exist;

          // check node
          node.mapping.should.equal(mappingName);

          // check properties
          node.properties.should.eql(nodeProperties);

          return NodeService.setProperties(testExecutionContext, node.uuid, nodePropertiesUpdate);
        })
        .then((node) => {
          chai.should().exist(node);

          // check UUID
          node.uuid.should.exist;

          // check node
          node.mapping.should.equal(mappingName);

          // check properties
          node.properties.should.eql(nodePropertiesUpdate);
        })
        .then(done)
        .catch(done);
    });
  });
}

export default nodeServiceTests;
