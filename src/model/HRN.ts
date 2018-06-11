/**
 * HRN namespaces.
 */
export enum HRNNamespace {
  Node = "node",
  Mapping = "mapping",
  User = "user",
  Resource = "resource"
}

/**
 * HRN Id.
 */
export type HRNId = string;

/**
 * Hyperdoc Resource Name (HRN).
 */
export interface HRN {
  readonly namespace: HRNNamespace;
  readonly id: HRNId;
}

/**
 * HRN string pattern.
 *
 * hyperdoc:$NAMESPACE:$ID
 */
export const HRNPattern = /^hyperdoc:(\w+):([a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12})$/i;
