// tslint:disable:no-unused-expression

// test framework dependencies
import { expect } from "chai";
import { Schema } from "jsonschema";
import "mocha";

// models
import { MappingProperties, MappingPropertyType, MappingNestedProperty } from "../../src/model/Mapping";

// model schemas
import { MappingSchemaGenerator } from "../../src/validation/MappingSchemaGenerator";

import { TestDataGenerator } from "../util/TestDataGenerator";

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
