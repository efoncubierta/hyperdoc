// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// Hyperdoc dependencies
import { MappingStore } from "../../../src/store/MappingStore";
import { MappingDynamoDBStore } from "../../../src/store/aws/MappingDynamoDBStore";

// test dependencies
import { TestDataGenerator } from "../../util/TestDataGenerator";
import { AWSMock } from "../../mock/aws";
import { InMemoryMappingStore } from "../../mock/InMemoryMappingStore";

const testExecutionContext = TestDataGenerator.randomExecutionContext();

let mappingStore: MappingStore;

function mappingServiceTests() {
  describe("MappingDynamoDBStore", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);

      AWSMock.enableMock();

      mappingStore = new MappingDynamoDBStore();
    });

    beforeEach(() => {
      // clean up mappings in-memory before each test
      InMemoryMappingStore.reset();
    });

    after(() => {
      AWSMock.restoreMock();
    });

    it("get() should resolve to None for a random MappingId", () => {
      const mappingId = TestDataGenerator.randomMappingId();

      return mappingStore.get(mappingId).then((mappingOpt) => {
        chai.should().exist(mappingOpt);
        mappingOpt.isNone().should.be.true;
      });
    });

    it("get() should resolve to Some for an existing mapping", () => {
      const mapping = TestDataGenerator.randomMapping();

      return mappingStore
        .put(mapping)
        .then(() => {
          return mappingStore.get(mapping.mappingId);
        })
        .then((mappingOpt) => {
          chai.should().exist(mappingOpt);
          mappingOpt.isSome().should.be.true;

          const m = mappingOpt.getOrElse(null);
          chai.should().exist(m);

          m.should.eql(mapping);
        });
    });

    it("getByName() should resolve to None for a random mapping name", () => {
      const mappingName = TestDataGenerator.randomMappingName();

      return mappingStore.getByName(mappingName).then((mappingOpt) => {
        chai.should().exist(mappingOpt);
        mappingOpt.isNone().should.be.true;
      });
    });

    it("getByName() should resolve to Some for an existing mapping", () => {
      const mapping = TestDataGenerator.randomMapping();

      return mappingStore
        .put(mapping)
        .then(() => {
          return mappingStore.getByName(mapping.name);
        })
        .then((mappingOpt) => {
          chai.should().exist(mappingOpt);
          mappingOpt.isSome().should.be.true;

          const m = mappingOpt.getOrElse(null);
          chai.should().exist(m);

          m.should.eql(mapping);
        });
    });

    it("list() should return all mappings stored", () => {
      const mappings = [
        TestDataGenerator.randomMapping(),
        TestDataGenerator.randomMapping(),
        TestDataGenerator.randomMapping()
      ];

      const promises = mappings.map((mapping) => {
        return mappingStore.put(mapping);
      });

      return Promise.all(promises)
        .then(() => {
          return mappingStore.list();
        })
        .then((foundMappings) => {
          chai.should().exist(foundMappings);
          foundMappings.length.should.be.equal(mappings.length);
        });
    });

    it("delete() should be idempotent for a random mapping", () => {
      const mappingId = TestDataGenerator.randomMappingId();

      return mappingStore.delete(mappingId).should.not.be.rejected;
    });

    it("delete() should delete an existing mapping", () => {
      const mapping = TestDataGenerator.randomMapping();

      return mappingStore
        .put(mapping)
        .then(() => {
          return mappingStore.get(mapping.mappingId);
        })
        .then((mappingOpt) => {
          chai.should().exist(mappingOpt);
          mappingOpt.isSome().should.be.true;

          const n = mappingOpt.getOrElse(null);
          chai.should().exist(n);

          n.should.eql(mapping);

          return mappingStore.delete(mapping.mappingId);
        })
        .then(() => {
          return mappingStore.get(mapping.mappingId);
        })
        .then((mappingOpt) => {
          chai.should().exist(mappingOpt);
          mappingOpt.isNone().should.be.true;
        });
    });
  });
}

export default mappingServiceTests;
