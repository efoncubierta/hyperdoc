// tslint:disable:no-unused-expression
import { expect } from "chai";
import "mocha";

import NodeService from "../../src/service/NodeService";
import TestDataGenerator from "../util/TestDataGenerator";

const testExecutionContext = TestDataGenerator.randomExecutionContext();

function nodeServiceTests() {
  describe("NodeService", () => {
    it("should not get a non-existing node", (done) => {
      NodeService.get(testExecutionContext, TestDataGenerator.randomUUID())
        .then((node) => {
          expect(node).to.not.exist;
        })
        .then(done);
    });

    it("should get an existing node", (done) => {
      const testNode = TestDataGenerator.randomNode();

      // add node to store so it can be fetched by the service
      testExecutionContext.stores.nodes
        .save(testNode)
        .then((node) => {
          return NodeService.get(testExecutionContext, testNode.uuid);
        })
        .then((node) => {
          expect(node).to.exist;
        })
        .then(done);
    });

    it("should create a valid node", (done) => {
      const testMappingName = TestDataGenerator.randomMappingName();
      const testNodeProperties = TestDataGenerator.randomNodeProperties();

      NodeService.create(testExecutionContext, testMappingName, testNodeProperties)
        .then((node) => {
          expect(node).to.exist;

          // check UUID
          expect(node.uuid).to.exist;

          // check mapping
          expect(node.mapping).to.equal(testMappingName);

          // check properties
          expect(node.properties).to.eql(testNodeProperties);

          // check audit
          expect(node.audit.createdAt).to.exist;
          expect(node.audit.createdBy).to.equal(testExecutionContext.auth.userUuid);
          expect(node.audit.modifiedAt).to.exist;
          expect(node.audit.modifiedBy).to.equal(testExecutionContext.auth.userUuid);
        })
        .then(done);
    });
  });
}

export default nodeServiceTests;
