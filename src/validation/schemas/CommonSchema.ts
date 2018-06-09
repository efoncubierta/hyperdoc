import { Schema } from "jsonschema";

export const UUIDSchema: Schema = {
  id: "/Model/UUID",
  type: "string",
  pattern: "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$"
};

export const HRNSchema: Schema = {
  id: "/Model/HRN",
  type: "object",
  properties: {
    namespace: {
      type: "string",
      enum: ["mapping", "node", "user", "resource"]
    },
    id: {
      type: "string",
      pattern: "^[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}$"
    }
  },
  required: ["namespace", "id"]
};
