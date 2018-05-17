// tslint:disable:no-unused-expression
import { expect } from "chai";
import "mocha";

import { TestDataGenerator } from "../util/TestDataGenerator";
import { Schema } from "jsonschema";
import {
  Mapping,
  MappingProperties,
  MappingPropertyType,
  MappingNestedProperty,
  MappingSchemaGenerator
} from "../../src";

function expectType(property: Schema, type: string, multiple: boolean) {
  if (multiple) {
    expect(property).to.exist;
    expect(property.type).to.equal("array");
    expectType(property.items as Schema, type, false); // recursion
  } else {
    expect(property).to.exist;
    expect(property.type).to.equal(type);
  }
}

function validateSchema(mappingProperties: MappingProperties, schema: Schema) {
  Object.keys(mappingProperties).forEach((propertyName) => {
    const schemaProperty = schema.properties[propertyName];
    const mappingProperty = mappingProperties[propertyName];
    const mappingPropertyType = mappingProperty.type;
    const multiple = mappingProperty.multiple;

    switch (mappingPropertyType) {
      case MappingPropertyType.Boolean:
        expectType(schemaProperty, "boolean", multiple);
        break;
      case MappingPropertyType.Date:
      case MappingPropertyType.Text:
        expectType(schemaProperty, "string", multiple);
        break;
      case MappingPropertyType.Float:
      case MappingPropertyType.Integer:
        expectType(schemaProperty, "number", multiple);
        break;
      case MappingPropertyType.Nested:
        expectType(schemaProperty, "object", multiple);
        validateSchema((mappingProperty as MappingNestedProperty).properties, schemaProperty);
        break;
    }
  });
}

function mappingSchemaGeneratorTest() {
  describe("MappingSchemaGenerator", () => {
    it("should generate a valid JSON schema from a mapping", () => {
      const fullMapping = TestDataGenerator.fullMapping();
      const fullSchema = MappingSchemaGenerator.toNodePropertiesSchema(fullMapping);

      expect(fullSchema).to.exist;
      validateSchema(fullMapping.properties, fullSchema);
    });
  });
}

export default mappingSchemaGeneratorTest;
