import { Schema } from "jsonschema";

export const NodeSchema: Schema = {
  id: "/Model/Node",
  type: "object",
  properties: {
    nodeId: {
      $ref: "/Model/UUID"
    },
    mappingName: {
      type: "string"
    },
    properties: {
      $ref: "/Model/NodeProperties"
    }
    // audit: {
    //   $ref: "/Audit"
    // }
  },
  required: ["nodeId", "mappingName", "properties"],
  additionalProperties: false
};

export const NodePropertiesSchema: Schema = {
  id: "/Model/NodeProperties",
  type: "object",
  patternProperties: {
    ".*": { $ref: "/Model/NodeProperty" }
  }
};

export const NodePropertySchema: Schema = {
  id: "/Model/NodeProperty",
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
      $ref: "/Model/NodeProperties"
    }
  ]
};
