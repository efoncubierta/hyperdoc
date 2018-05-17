// tslint:disable:no-unused-expression
import "mocha";

import nodeValidatorTest from "./NodeValidator";
import mappingSchemaGeneratorTest from "./MappingSchemaGenerator";
import nodePropertiesMappingGeneratorTest from "./NodePropertiesMappingGenerator";

describe("Core :: Validation", () => {
  nodeValidatorTest();
  mappingSchemaGeneratorTest();
  nodePropertiesMappingGeneratorTest();
});
