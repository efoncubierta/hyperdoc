import { Schema } from "jsonschema";

export const MappingSchema: Schema = {
  id: "/Model/Mapping",
  type: "object",
  properties: {
    mappingId: {
      $ref: "/Model/UUID"
    },
    name: {
      $ref: "/Model/MappingName"
    },
    properties: {
      $ref: "/Model/MappingProperties"
    }
  },
  required: ["mappingId", "name", "properties"],
  additionalProperties: false
};

export const MappingNameSchema: Schema = {
  id: "/Model/MappingName",
  type: "string",
  minLength: 3,
  maxLength: 30,
  pattern: "^[a-z]+$"
};

export const MappingPropertiesSchema: Schema = {
  id: "/Model/MappingProperties",
  type: "object",
  patternProperties: {
    ".*": { $ref: "/Model/MappingProperty" }
  }
};

export const MappingPropertySchema: Schema = {
  id: "/Model/MappingProperty",
  type: "object",
  properties: {
    type: {
      type: "text",
      enum: ["integer", "text", "float", "boolean", "date", "nested", "node", "resource"]
    },
    mandatory: {
      type: "boolean"
    },
    multiple: {
      type: "boolean"
    },
    properties: {
      $ref: "/Model/MappingProperties"
    },
    mapping: {
      type: "string"
    }
  },
  required: ["type", "mandatory", "multiple"],
  additionalProperties: false
};
