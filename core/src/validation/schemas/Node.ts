import { Schema } from "jsonschema";

export const NodePropertySchema: Schema = {
  id: "/NodeProperty",
  oneOf: [
    {
      type: ["string", "number", "boolean", "array"]
    },
    {
      $ref: "/NodeProperties"
    }
  ]
};

export const NodePropertiesSchema: Schema = {
  id: "/NodeProperties",
  type: "object",
  patternProperties: {
    ".*": { $ref: "/NodeProperty" }
  }
};

export const NodeSchema: Schema = {
  id: "/Node",
  type: "object",
  properties: {
    uuid: {
      type: "string"
    },
    mapping: {
      type: "string"
    },
    properties: {
      $ref: "/NodeProperties"
    },
    audit: {
      $ref: "/Audit"
    }
  },
  required: ["uuid", "mapping", "properties", "audit"]
};
