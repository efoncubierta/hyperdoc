/**
 * Mapping type.
 */
export interface Mapping {
  uuid: MappingId;
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
export type MappingKey = Pick<Mapping, "uuid">;

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
  properties?: MappingProperties;
}

export interface MappingNodeProperty extends MappingProperty {
  mapping?: string;
}
