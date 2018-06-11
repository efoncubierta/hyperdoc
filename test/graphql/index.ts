// tslint:disable:no-unused-expression

// test framework dependencies
import * as chai from "chai";
import "mocha";

// External dependencies
import { GraphQLObjectType } from "graphql";

// Hyperdoc models
import { Mappings, MappingPropertyType, MappingStrictnessLevel } from "../../src/model/Mapping";

// Hyperdoc GraphQL
import { MappingsToGraphQLSchemaMapper } from "../../src/graphql/MappingsToGraphQLSchemaMapper";

// test dependencies
import { TestDataGenerator } from "../util/TestDataGenerator";

const MAPPINGS: Mappings = {
  Type1: {
    mappingId: TestDataGenerator.randomUUID(),
    name: "Type1",
    strictness: MappingStrictnessLevel.Organic,
    properties: {
      type2: {
        type: MappingPropertyType.Node,
        mandatory: true,
        multiple: false,
        mapping: "Type2"
      },
      name: {
        type: MappingPropertyType.Text,
        mandatory: true,
        multiple: false
      },
      dates: {
        type: MappingPropertyType.Nested,
        mandatory: true,
        multiple: false,
        properties: {
          from: {
            type: MappingPropertyType.Date,
            mandatory: true,
            multiple: false
          },
          to: {
            type: MappingPropertyType.Date,
            mandatory: false,
            multiple: false
          }
        }
      },
      tags: {
        type: MappingPropertyType.Text,
        mandatory: false,
        multiple: true
      }
    }
  },
  Type2: {
    mappingId: TestDataGenerator.randomUUID(),
    name: "Type2",
    strictness: MappingStrictnessLevel.Organic,
    properties: {
      name: {
        type: MappingPropertyType.Text,
        mandatory: true,
        multiple: false
      }
    }
  }
} as Mappings;

function graphqlTests() {
  describe("GraphQL", () => {
    describe("Mapper", () => {
      it("should maps the mappings to GraphQL schema", () => {
        const mapper = new MappingsToGraphQLSchemaMapper();
        const graphqlSchema = mapper.map(MAPPINGS);

        chai.should().exist(graphqlSchema);

        // validate query type
        const queryType = graphqlSchema.getQueryType();
        const queryTypeFields = queryType.getFields();
        chai.should().exist(queryType);
        chai.should().exist(queryTypeFields);
        queryTypeFields.Type1.should.exist;
        queryTypeFields.Type2.should.exist;
        queryTypeFields.Node.should.exist;

        // validate mutation type
        const mutationType = graphqlSchema.getMutationType();
        chai.should().exist(mutationType);

        // validate Type 1 type
        const type1Type = graphqlSchema.getType("Type1") as GraphQLObjectType;
        const type1TypeFields = type1Type.getFields();
        chai.should().exist(type1Type);
        chai.should().exist(type1TypeFields);

        type1TypeFields.name.should.exist;
        type1TypeFields.dates.should.exist;
        type1TypeFields.tags.should.exist;

        type1TypeFields.type2.should.exist;
      });
    });
  });
}

export default graphqlTests;
