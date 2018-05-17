// tslint:disable:no-unused-expression
import * as UUID from "uuid";
import { expect } from "chai";
import "mocha";

import { GraphQLObjectType } from "graphql";

import { Mappings, MappingPropertyType } from "../../core/dist/model/Mapping";
import mappingsToGraphql from "../src/graphql/mapper";

const MAPPINGS: Mappings = {
  Type1: {
    uuid: UUID.v1(),
    name: "Type1",
    properties: {
      // type2: {
      //   type: MappingPropertyType.Node,
      //   mandatory: true,
      //   multiple: false,
      //   mapping: "Type2"
      // },
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
    uuid: UUID.v1(),
    name: "Type2",
    properties: {
      name: {
        type: MappingPropertyType.Text,
        mandatory: true,
        multiple: false
      }
    }
  }
} as Mappings;

describe("REST API :: GraphQL", () => {
  describe("Mapper", () => {
    it("should maps the mappings to GraphQL schema", (done) => {
      mappingsToGraphql(MAPPINGS)
        .then((graphqlSchema) => {
          expect(graphqlSchema).to.exist;

          // validate query type
          const queryType = graphqlSchema.getQueryType();
          const queryTypeFields = queryType.getFields();
          expect(queryType).to.exist;
          expect(queryTypeFields.Type1).to.exist;
          expect(queryTypeFields.Type2).to.exist;
          expect(queryTypeFields.Node).to.exist;

          // validate mutation type
          const mutationType = graphqlSchema.getMutationType();
          const mutationTypeFields = mutationType.getFields();
          expect(mutationType).to.exist;

          // validate Type 1 type
          const type1Type = graphqlSchema.getType("Type1") as GraphQLObjectType;
          const type1TypeFields = type1Type.getFields();
          expect(type1Type).to.exist;

          expect(type1TypeFields.name).to.exist;
          expect(type1TypeFields.dates).to.exist;
          expect(type1TypeFields.tags).to.exist;
        })
        .then(done);
    });
  });
});
