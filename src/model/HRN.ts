export enum HRNNamespace {
  Node = "node",
  Mapping = "mapping",
  User = "user",
  Resource = "resource"
}

export interface HRN {
  readonly namespace: HRNNamespace;
  readonly id: string;
}

export const HRNPattern = /^hyperdoc:(\\w+):([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/i;
