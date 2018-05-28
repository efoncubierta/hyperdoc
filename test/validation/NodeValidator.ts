// tslint:disable:no-unused-expression
import { expect } from "chai";
import "mocha";

// model schemas
import { NodeValidator } from "../../src/validation/NodeValidator";
import { NodeSchema } from "../../src/validation/schemas/NodeSchema";

import { TestDataGenerator } from "../util/TestDataGenerator";

function nodeValidatorTest() {
  describe("NodeValidator", () => {
    it("should validate a node with the default validator", (done) => {
      const testNode = TestDataGenerator.randomFullNode();

      const validator = NodeValidator.getDefaultValidator();
      const result = validator.validate(testNode, NodeSchema);

      if (result.errors.length > 0) {
        done(new Error(result.errors[0].message));
      } else {
        done();
      }
    });

    it("should validate a node with a mapping custom validator", (done) => {
      const testMapping = TestDataGenerator.fullMapping();
      const testNode = TestDataGenerator.randomFullNode();

      const validator = NodeValidator.getValidatorFromMapping(testMapping);
      const result = validator.validate(testNode, NodeSchema);

      if (result.errors.length > 0) {
        done(new Error(result.errors[0].message));
      } else {
        done();
      }
    });
  });
}

export default nodeValidatorTest;
