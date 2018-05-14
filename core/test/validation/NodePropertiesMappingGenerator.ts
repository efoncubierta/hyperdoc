// tslint:disable:no-unused-expression
import { expect } from "chai";
import "mocha";

import TestDataGenerator from "../util/TestDataGenerator";
import NodePropertiesMappingGenerator from "../../src/validation/NodePropertiesMappingGenerator";
import { IMappingProperties, IMappingPropertyType, IMappingProperty } from "../../src/model/IMapping";
import { INodeProperties } from "../../src/model/INode";

function validateMappingProperty(nodeProperty: any, mappingProperty: IMappingProperty) {
  if (Array.isArray(nodeProperty)) {
    expect(mappingProperty.multiple).to.be.true;
    validateMappingProperty(nodeProperty[0], mappingProperty); // recursion
  } else if (typeof nodeProperty === "string") {
    expect(mappingProperty.type).to.be.oneOf([IMappingPropertyType.Date, IMappingPropertyType.Text]);
  } else if (typeof nodeProperty === "number") {
    expect(mappingProperty.type).to.be.oneOf([IMappingPropertyType.Integer, IMappingPropertyType.Float]);
  } else if (typeof nodeProperty === "boolean") {
    expect(mappingProperty.type).to.equal(IMappingPropertyType.Boolean);
  } else if (typeof nodeProperty === "object") {
    expect(mappingProperty.type).to.equal(IMappingPropertyType.Nested);
  } else {
    throw new Error(`Unknown node property value ${nodeProperty}`);
  }
}

function validateMapping(nodeProperties: INodeProperties, mappingProperties: IMappingProperties) {
  Object.keys(nodeProperties).forEach((propertyName) => {
    const nodeProperty = nodeProperties[propertyName];
    const mappingProperty = mappingProperties[propertyName];

    validateMappingProperty(nodeProperty, mappingProperty);
  });
}

function nodePropertiesMappingGeneratorTest() {
  describe("NodePropertiesMappingGenerator", () => {
    it("should generate a valid mapping from node properties", () => {
      const mappingName = TestDataGenerator.randomMappingName();
      const nodeProperties = TestDataGenerator.randomFullNodeProperties();

      const mapping = NodePropertiesMappingGenerator.toMapping(mappingName, nodeProperties);

      expect(mapping).to.exist;
      validateMapping(nodeProperties, mapping.properties);
    });
  });
}

export default nodePropertiesMappingGeneratorTest;
