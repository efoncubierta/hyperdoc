/**
 * Mapping type unique key.
 */
export interface MappingKey {
  uuid: string;
}

/**
 * Mapping reference.
 */
export interface MappingRef {
  mappingKey: MappingKey;
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

/**
 * Mapping properties.
 */
export interface MappingProperties {
  [x: string]: MappingProperty;
}

/**
 * Mapping type.
 */
export interface Mapping extends MappingKey {
  name: string;
  properties: MappingProperties;
}

/**
 * Mappings directionary.
 */
export interface Mappings {
  [x: string]: Mapping;
}

/**
 * Mapping type builder.
 *
 * NOTE: this builder is not great. It comes with many problems.
 */
export class MappingBuilder {
  private n: Mapping;

  constructor(mapping?: Mapping) {
    this.n = mapping ? mapping : ({} as Mapping);
  }

  public uuid(uuid: string): MappingBuilder {
    this.n.uuid = uuid;
    return this;
  }

  public name(name: string): MappingBuilder {
    this.n.name = name;
    return this;
  }

  public properties(properties: MappingProperties): MappingBuilder {
    this.n.properties = properties;
    return this;
  }

  public build(): Mapping {
    return this.n;
  }
}
