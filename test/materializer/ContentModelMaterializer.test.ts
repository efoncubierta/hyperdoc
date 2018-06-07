// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// Hyperdoc dependencies
import { ContentModelMaterializer } from "../../src/materializer/ContentModelMaterializer";
import { MappingStateName } from "../../src/model/Mapping";
import { MappingAggregate } from "../../src/aggregate/MappingAggregate";

// test dependencies
import { AWSMock } from "../mock/aws";
import { TestDataGenerator } from "../util/TestDataGenerator";
import { InMemoryMappingStore } from "../mock/InMemoryMappingStore";
import { InMemoryNodeStore } from "../mock/InMemoryNodeStore";

let contentModelMaterializer: ContentModelMaterializer;

function contentModelMaterializerTests() {
  describe("ContentModelMaterializer", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);

      AWSMock.enableMock();

      contentModelMaterializer = new ContentModelMaterializer();
    });

    beforeEach(() => {
      InMemoryMappingStore.reset();
      InMemoryNodeStore.reset();
    });

    after(() => {
      AWSMock.restoreMock();
    });

    it("handle() should keep a node up to date through its lifecycle", () => {
      const nodeId = TestDataGenerator.randomNodeId();
      const nodeCreated = TestDataGenerator.randomNodeCreatedV1(nodeId);
      const nodePropertiesUpdated = TestDataGenerator.randomNodePropertiesUpdatedV1(nodeId);
      const nodeDisabled = TestDataGenerator.randomNodeDisabledV1(nodeId);
      const nodeEnabled = TestDataGenerator.randomNodeEnabledV1(nodeId);
      const nodeLocked = TestDataGenerator.randomNodeLockedV1(nodeId);
      const nodeUnlocked = TestDataGenerator.randomNodeUnlockedV1(nodeId);
      const nodeDeleted = TestDataGenerator.randomNodeDeletedV1(nodeId);

      return contentModelMaterializer
        .handle(nodeCreated)
        .then(() => {
          const node = InMemoryNodeStore.get(nodeId);
          chai.should().exist(node);
          node.mappingName.should.be.equal(nodeCreated.payload.mappingName);
          node.properties.should.be.eql(nodeCreated.payload.properties);

          return contentModelMaterializer.handle(nodePropertiesUpdated);
        })
        .then(() => {
          const node = InMemoryNodeStore.get(nodeId);
          chai.should().exist(node);
          node.mappingName.should.be.equal(nodeCreated.payload.mappingName);
          node.properties.should.be.eql(nodePropertiesUpdated.payload.properties);

          return contentModelMaterializer.handle(nodeDisabled);
        })
        .then(() => {
          const node = InMemoryNodeStore.get(nodeId);
          chai.should().exist(node);
          node.mappingName.should.be.equal(nodeCreated.payload.mappingName);
          node.properties.should.be.eql(nodePropertiesUpdated.payload.properties);

          return contentModelMaterializer.handle(nodeEnabled);
        })
        .then(() => {
          const node = InMemoryNodeStore.get(nodeId);
          chai.should().exist(node);
          node.mappingName.should.be.equal(nodeCreated.payload.mappingName);
          node.properties.should.be.eql(nodePropertiesUpdated.payload.properties);

          return contentModelMaterializer.handle(nodeLocked);
        })
        .then(() => {
          const node = InMemoryNodeStore.get(nodeId);
          chai.should().exist(node);
          node.mappingName.should.be.equal(nodeCreated.payload.mappingName);
          node.properties.should.be.eql(nodePropertiesUpdated.payload.properties);

          return contentModelMaterializer.handle(nodeUnlocked);
        })
        .then(() => {
          const node = InMemoryNodeStore.get(nodeId);
          chai.should().exist(node);
          node.mappingName.should.be.equal(nodeCreated.payload.mappingName);
          node.properties.should.be.eql(nodePropertiesUpdated.payload.properties);

          return contentModelMaterializer.handle(nodeDeleted);
        })
        .then(() => {
          const node = InMemoryNodeStore.get(nodeId);
          chai.should().not.exist(node);
        });
    });

    it("handle() should keep a mapping up to date through its lifecycle", () => {
      const mappingId = TestDataGenerator.randomMappingId();
      const mappingCreated = TestDataGenerator.randomMappingCreatedV1(mappingId);
      const mappingPropertiesUpdated = TestDataGenerator.randomMappingPropertiesUpdatedV1(mappingId);
      const mappingDeleted = TestDataGenerator.randomMappingDeletedV1(mappingId);

      return contentModelMaterializer
        .handle(mappingCreated)
        .then(() => {
          const mapping = InMemoryMappingStore.get(mappingId);
          chai.should().exist(mapping);
          mapping.name.should.be.equal(mappingCreated.payload.name);
          mapping.properties.should.be.eql(mappingCreated.payload.properties);

          return contentModelMaterializer.handle(mappingPropertiesUpdated);
        })
        .then(() => {
          const mapping = InMemoryMappingStore.get(mappingId);
          chai.should().exist(mapping);
          mapping.name.should.be.equal(mappingCreated.payload.name);
          mapping.properties.should.be.eql(mappingPropertiesUpdated.payload.properties);

          return contentModelMaterializer.handle(mappingDeleted);
        })
        .then(() => {
          const mapping = InMemoryMappingStore.get(mappingId);
          chai.should().not.exist(mapping);
        });
    });
  });
}

export default contentModelMaterializerTests;
