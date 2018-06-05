// external dependencies
import { Schema, Validator } from "jsonschema";

// models
import { Mapping } from "../model/Mapping";

// model schemas
import { AuditSchema, NodePropertySchema, NodePropertiesSchema } from "./schemas";

import { MappingSchemaGenerator } from "./MappingSchemaGenerator";

/**
 * Node validator.
 */
export class NodeValidator {
  /**
   * Get a node validator based on a custom node properties schema.
   *
   * @param nodePropertiesSchema - Node properties JSON schema
   * @returns JSON schema validator
   */
  private static getNodeValidator(nodePropertiesSchema: Schema): Validator {
    // create validator with custom node schema
    const validator = new Validator();
    validator.addSchema(AuditSchema, AuditSchema.id);
    validator.addSchema(NodePropertySchema, NodePropertySchema.id);
    validator.addSchema(nodePropertiesSchema, NodePropertiesSchema.id);

    return validator;
  }

  /**
   * Get the default node validator based on the Node JSON schema.
   *
   * @returns JSON schema validator
   */
  public static getDefaultValidator(): Validator {
    return this.getNodeValidator(NodePropertiesSchema);
  }

  /**
   * Get node validator based on the Node JSON schema plus custom mapping schema.
   *
   * @param mapping Mapping
   * @returns JSON schema validator
   */
  public static getValidatorFromMapping(mapping: Mapping): Validator {
    return this.getNodeValidator(MappingSchemaGenerator.toNodePropertiesSchema(mapping));
  }
}
