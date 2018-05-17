import { Schema } from "jsonschema";

export const AuditSchema: Schema = {
  id: "/Audit",
  type: "object",
  properties: {
    createdAt: {
      type: "string"
    },
    createdBy: {
      type: "string"
    },
    modifiedAt: {
      type: "string"
    },
    modifiedBy: {
      type: "string"
    }
  }
};
