import { Schema } from "jsonschema";

export const NodeSchema: Schema = {
  id: "/Node",
  type: "object",
  properties: {
    id: {
      type: "string"
    },
    mappingName: {
      type: "string"
    },
    properties: {
      $ref: "/NodeProperties"
    }
    // audit: {
    //   $ref: "/Audit"
    // }
  },
  required: ["id", "mappingName", "properties"]
};

export const NodePropertiesSchema: Schema = {
  id: "/NodeProperties",
  type: "object",
  patternProperties: {
    ".*": { $ref: "/NodeProperty" }
  }
};

export const NodePropertySchema: Schema = {
  id: "/NodeProperty",
  oneOf: [
    {
      type: ["string", "number", "boolean"]
    },
    {
      type: "array",
      items: {
        type: ["string", "number", "boolean"]
      }
    },
    {
      $ref: "/NodeProperties"
    }
  ]
};
