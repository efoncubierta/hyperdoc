import { Schema, Validator } from "jsonschema";
import { AuditSchema } from "./schemas/Audit";
import { NodePropertySchema, NodePropertiesSchema } from "./schemas/Node";
import { Mapping } from "../model/Mapping";
import MappingSchemaGenerator from "./MappingSchemaGenerator";

/**
 * Node validator.
 */
export default class NodeValidator {
  /**
   * Get a node validator based on a custom node properties schema.
   *
   * @param {Schema} nodePropertiesSchema - Node properties JSON schema
   * @returns {Validator} JSON schema validator
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
   * @returns {Validator} JSON schema validator
   */
  public static getDefaultValidator(): Validator {
    return this.getNodeValidator(NodePropertiesSchema);
  }

  /**
   * Get node validator based on the Node JSON schema plus custom mapping schema.
   *
   * @param {Mapping} mapping - Mapping
   * @returns {Validator} JSON schema validator
   */
  public static getValidatorFromMapping(mapping?: Mapping): Validator {
    return this.getNodeValidator(MappingSchemaGenerator.toNodePropertiesSchema(mapping));
  }
}
