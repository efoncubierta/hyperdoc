/**
 * Mapping type.
 */
export interface Mapping {
  readonly mappingId: MappingId;
  readonly name: string;
  readonly properties: MappingProperties;
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
  readonly type: MappingPropertyType;
  readonly mandatory: boolean;
  readonly multiple: boolean;
}

export interface MappingNestedProperty extends MappingProperty {
  readonly properties: MappingProperties;
}

export interface MappingNodeProperty extends MappingProperty {
  readonly mapping: string;
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
