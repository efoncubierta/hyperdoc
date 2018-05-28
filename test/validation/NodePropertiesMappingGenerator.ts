// tslint:disable:no-unused-expression

// test framework dependencies
import { expect } from "chai";
import "mocha";

// models
import { MappingProperties, MappingPropertyType, MappingProperty } from "../../src/model/Mapping";
import { NodeProperties } from "../../src/model/Node";

// schemas
import { NodePropertiesMappingGenerator } from "../../src/validation/NodePropertiesMappingGenerator";

import { TestDataGenerator } from "../util/TestDataGenerator";

function validateMappingProperty(nodeProperty: any, mappingProperty: MappingProperty) {
  if (Array.isArray(nodeProperty)) {
    expect(mappingProperty.multiple).to.be.true;
    validateMappingProperty(nodeProperty[0], mappingProperty); // recursion
  } else if (typeof nodeProperty === "string") {
    expect(mappingProperty.type).to.be.oneOf([MappingPropertyType.Date, MappingPropertyType.Text]);
  } else if (typeof nodeProperty === "number") {
    expect(mappingProperty.type).to.be.oneOf([MappingPropertyType.Integer, MappingPropertyType.Float]);
  } else if (typeof nodeProperty === "boolean") {
    expect(mappingProperty.type).to.equal(MappingPropertyType.Boolean);
  } else if (typeof nodeProperty === "object") {
    expect(mappingProperty.type).to.equal(MappingPropertyType.Nested);
  } else {
    throw new Error(`Unknown node property value ${nodeProperty}`);
  }
}

function validateMapping(nodeProperties: NodeProperties, mappingProperties: MappingProperties) {
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
