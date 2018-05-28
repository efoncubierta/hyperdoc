// tslint:disable:no-unused-expression
import "mocha";

import nodeValidatorTest from "./NodeValidator";
import mappingSchemaGeneratorTest from "./MappingSchemaGenerator";
import nodePropertiesMappingGeneratorTest from "./NodePropertiesMappingGenerator";

function validationTests() {
  describe("Validation", () => {
    nodeValidatorTest();
    mappingSchemaGeneratorTest();
    nodePropertiesMappingGeneratorTest();
  });
}

export default validationTests;
