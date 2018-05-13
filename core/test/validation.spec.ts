// tslint:disable:no-unused-expression
import * as UUID from "uuid";
import { expect } from "chai";
import "mocha";

import { NodeSchema } from "../src/validation/schemas/Node";

import { INode } from "../src/model/INode";
import { IMappingPropertyType, IMapping, IMappingNodeProperty, IMappingNestedProperty } from "../src/model/IMapping";

import NodeValidation from "../src/validation/NodeValidation";

const DUMMY_NODE: INode = {
  uuid: UUID.v1(),
  mapping: "Type1",
  properties: {
    stringProp: "Property",
    intProp: 1,
    floatProp: 1.1,
    boolProp: true,
    dateProp: "2018-05-13T10:00:00+00:00",
    nestedProp: {
      nestedSubprop: {
        stringSubprop: "Subproperty"
      }
    },
    nodeProp: UUID.v1()
  },
  audit: {
    createdAt: "",
    createdBy: "admin",
    modifiedAt: "",
    modifiedBy: "admin"
  }
};

const DUMMY_MAPPING: IMapping = {
  uuid: UUID.v1(),
  name: "Type1",
  properties: {
    stringProp: {
      type: IMappingPropertyType.Text,
      mandatory: true,
      multiple: false
    },
    intProp: {
      type: IMappingPropertyType.Integer,
      mandatory: true,
      multiple: false
    },
    floatProp: {
      type: IMappingPropertyType.Float,
      mandatory: true,
      multiple: false
    },
    boolProp: {
      type: IMappingPropertyType.Boolean,
      mandatory: true,
      multiple: false
    },
    dateProp: {
      type: IMappingPropertyType.Date,
      mandatory: true,
      multiple: false
    },
    nestedProp: {
      type: IMappingPropertyType.Nested,
      mandatory: true,
      multiple: false,
      properties: {
        nestedSubprop: {
          type: IMappingPropertyType.Nested,
          mandatory: true,
          multiple: false,
          properties: {
            stringSubprop: {
              type: IMappingPropertyType.Text,
              mandatory: true,
              multiple: false
            }
          }
        }
      }
    } as IMappingNestedProperty,
    nodeProp: {
      type: IMappingPropertyType.Node,
      mandatory: true,
      multiple: false,
      mapping: "Type2"
    } as IMappingNodeProperty
  }
};

describe("Core :: Validation :: NodeValidation", () => {
  it("should get a default node validator and validate a node", () => {
    const validator = NodeValidation.getDefaultNodeValidator();
    const result = validator.validate(DUMMY_NODE, NodeSchema);
    expect(result.errors).to.be.empty;
  });

  it("should get a node validator from a mapping and validate a node", () => {
    const validator = NodeValidation.getNodeValidatorFromMapping(DUMMY_MAPPING);
    const result = validator.validate(DUMMY_NODE, NodeSchema);
    expect(result.errors).to.be.empty;
  });
});
