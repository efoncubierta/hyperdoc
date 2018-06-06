/**
 * Mapping type.
 */
export interface Mapping {
  mappingId: MappingId;
  name: string;
  properties: MappingProperties;
}

/**
 * Mapping id.
 */
export type MappingId = string;

/**
 * Mapping key.
 */
export type MappingKey = Pick<Mapping, "mappingId">;

/**
 * Mappings directionary.
 */
export interface Mappings {
  [x: string]: Mapping;
}

/**
 * Types of properties allowed in a mapping.
 */
export enum MappingPropertyType {
  Integer = "integer",
  Text = "text",
  Float = "float",
  Boolean = "boolean",
  Date = "date",
  Nested = "nested"
}

/**
 * Mapping properties.
 */
export interface MappingProperties {
  [x: string]: MappingProperty;
}

/**
 * Mapping property.
 */
export interface MappingProperty {
  type: MappingPropertyType;
  mandatory: boolean;
  multiple: boolean;
}

export interface MappingNestedProperty extends MappingProperty {
  properties: MappingProperties;
}

export interface MappingNodeProperty extends MappingProperty {
  mapping: string;
}

/**
 * Mapping state names.
 */
export enum MappingStateName {
  New = "New",
  Enabled = "Enabled",
  Deleted = "Deleted"
}

/**
 * Mapping state.
 */
export interface MappingState {
  readonly name: MappingStateName;
  readonly mapping?: Mapping;
}
