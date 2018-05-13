// tslint:disable:no-unused-expression
import * as UUID from "uuid";
import { expect } from "chai";
import "mocha";

import * as AWS from "aws-sdk-mock";
import * as _ from "underscore";

import { INode } from "../../src/model/INode";
import { IMappingPropertyType, IMapping, IMappingNodeProperty, IMappingNestedProperty } from "../../src/model/IMapping";
import NodeService from "../../src/service/NodeService";
import { IExecutionContext } from "../../src/model/IExecutionContext";
import NodeInmemoryStore from "../store/inmemory/NodeInmemoryStore";
import MappingInmemoryStore from "../store/inmemory/MappingInmemoryStore";

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

const DUMMY_CONTEXT: IExecutionContext = {
  auth: {
    userUuid: UUID.v1()
  },
  stores: {
    nodes: new NodeInmemoryStore(),
    mappings: new MappingInmemoryStore()
  }
};

describe("Core :: Service :: NodeService", () => {
  it("should create a valid node", (done) => {
    NodeService.create(DUMMY_CONTEXT, DUMMY_NODE.mapping, DUMMY_NODE.properties)
      .then((node) => {
        expect(node).to.exist;
      })
      .then(done);
  });
});
