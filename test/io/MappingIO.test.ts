// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import * as chaiAsPromised from "chai-as-promised";
import "mocha";

// Hyperdoc readers
import { MappingReader } from "../../src/reader/MappingReader";

// Hyperdoc writers
import { MappingWriter } from "../../src/writer/MappingWriter";
import { MappingWriterError } from "../../src/writer/MappingWriterError";

// Hyperdoc models
import { MappingProperties } from "../../src/model/Mapping";

// test dependencies
import { TestDataGenerator } from "../util/TestDataGenerator";
import { AWSMock } from "../mock/aws";
import { InMemoryMappingStore } from "../mock/InMemoryMappingStore";

const testExecutionContext = TestDataGenerator.randomExecutionContext();

function mappingServiceTests() {
  describe("MappingWriter/MappingReader", () => {
    before(() => {
      chai.should();
      chai.use(chaiAsPromised);

      AWSMock.enableMock();
    });

    beforeEach(() => {
      InMemoryMappingStore.reset();
    });

    after(() => {
      AWSMock.restoreMock();
    });

    it("get() should resolve to None for a random MappingId", () => {
      const mappingId = TestDataGenerator.randomMappingId();

      return MappingReader.get(testExecutionContext, mappingId).then((mappingOpt) => {
        chai.should().exist(mappingOpt);
        mappingOpt.isNone().should.be.true;
      });
    });

    it("get() should resolve to Some for an existing mapping", () => {
      const mapping = TestDataGenerator.randomMapping();

      // update in-memory store to facilite the new mapping to MappingService.get()
      InMemoryMappingStore.put(mapping);

      return MappingReader.get(testExecutionContext, mapping.mappingId).then((mappingOpt) => {
        chai.should().exist(mappingOpt);
        mappingOpt.isSome().should.be.true;

        const m = mappingOpt.getOrElse(null);
        chai.should().exist(m);

        m.should.eql(mapping);
      });
    });

    it("getByName() should resolve to None for a random mapping name", () => {
      const mappingName = TestDataGenerator.randomMappingName();

      return MappingReader.getByName(testExecutionContext, mappingName).then((mappingOpt) => {
        chai.should().exist(mappingOpt);
        mappingOpt.isNone().should.be.true;
      });
    });

    it("getByName() should resolve to Some for an existing mapping", () => {
      const mapping = TestDataGenerator.randomMapping();

      // update in-memory store to facilite the new mapping to MappingService.getByName()
      InMemoryMappingStore.put(mapping);

      return MappingReader.getByName(testExecutionContext, mapping.name).then((mappingOpt) => {
        chai.should().exist(mappingOpt);
        mappingOpt.isSome().should.be.true;

        const m = mappingOpt.getOrElse(null);
        chai.should().exist(m);

        m.should.eql(mapping);
      });
    });

    it("list() should resolve a dictionary of mapping", () => {
      for (let i = 0; i < 10; i++) {
        // update in-memory store to facilite a list of mappings to MappingService.list()
        InMemoryMappingStore.put(TestDataGenerator.randomMapping());
      }

      return MappingReader.list(testExecutionContext).then((mappings) => {
        chai.should().exist(mappings);
        Object.keys(mappings).length.should.be.equal(10);
      });
    });

    it("create() should be rejected if a mapping with the same name already exists", () => {
      const mappingName = TestDataGenerator.randomMappingName();
      const mappingProperties = TestDataGenerator.randomMappingProperties();

      return MappingWriter.create(testExecutionContext, mappingName, mappingProperties).then((mapping) => {
        chai.should().exist(mapping);

        mapping.name.should.equal(mappingName);
        mapping.properties.should.eql(mappingProperties);

        // update in-memory store to facilite the new node to MappingService.get()
        InMemoryMappingStore.put(mapping);

        const p = MappingWriter.create(testExecutionContext, mappingName, mappingProperties);
        return p.should.be.rejectedWith(MappingWriterError);
      });
    });

    it("create() should be rejected if a mapping name or properties are not valid", () => {
      const mappingName = TestDataGenerator.randomMappingName();
      const invalidMappingName = TestDataGenerator.randomUUID(); // UUID does not match the mapping name format
      const mappingProperties = TestDataGenerator.randomMappingProperties();
      const invalidMappingProperties: MappingProperties = {
        prop: {
          type: null,
          mandatory: false,
          multiple: false
        }
      };

      // invalid name and valid properties
      MappingWriter.create
        .bind(testExecutionContext, invalidMappingName, mappingProperties)
        .should.throw(MappingWriterError);

      // valid name and invalid properties
      MappingWriter.create
        .bind(testExecutionContext, mappingName, invalidMappingProperties)
        .should.throw(MappingWriterError);
    });

    it("setProperties() should be rejected for random MappingId", () => {
      const mappingId = TestDataGenerator.randomMappingId();
      const mappingProperties = TestDataGenerator.randomMappingProperties();

      return MappingWriter.setProperties(testExecutionContext, mappingId, mappingProperties).should.be.rejected;
    });

    it("setProperties() should set properties to an existing mapping", () => {
      const mappingName = TestDataGenerator.randomMappingName();
      const mappingProperties = TestDataGenerator.randomMappingProperties();
      const mappingProperties2 = TestDataGenerator.randomMappingProperties();

      let mappingId;
      return MappingWriter.create(testExecutionContext, mappingName, mappingProperties)
        .then((mapping) => {
          chai.should().exist(mapping);

          // set mappingId for testing
          mappingId = mapping.mappingId;

          mapping.name.should.equal(mappingName);
          mapping.properties.should.eql(mappingProperties);

          // update in-memory store to facilite the new node to MappingService.get()
          InMemoryMappingStore.put(mapping);

          return MappingWriter.setProperties(testExecutionContext, mappingId, mappingProperties2);
        })
        .then((mapping) => {
          chai.should().exist(mapping);

          // set mappingId for testing
          mappingId = mapping.mappingId;

          mapping.name.should.equal(mappingName);
          mapping.properties.should.eql(mappingProperties2);
        });
    });
  });
}

export default mappingServiceTests;
