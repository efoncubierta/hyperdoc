/**
 * Mapping type unique key.
 */
export interface IMappingKey {
  uuid: string;
}

/**
 * Mapping reference.
 */
export interface IMappingRef {
  mappingKey: IMappingKey;
}

/**
 * Types of properties allowed in a mapping.
 */
export enum IMappingPropertyType {
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
export interface IMappingProperty {
  type: IMappingPropertyType;
  mandatory: boolean;
  multiple: boolean;
}

export interface IMappingNestedProperty extends IMappingProperty {
  properties?: IMappingProperties;
}

export interface IMappingNodeProperty extends IMappingProperty {
  mapping?: string;
}

/**
 * Mapping properties.
 */
export interface IMappingProperties {
  [x: string]: IMappingProperty;
}

/**
 * Mapping type.
 */
export interface IMapping extends IMappingKey {
  name: string;
  properties: IMappingProperties;
}

/**
 * Mappings directionary.
 */
export interface IMappings {
  [x: string]: IMapping;
}

/**
 * Mapping type builder.
 *
 * NOTE: this builder is not great. It comes with many problems.
 */
export class MappingBuilder {
  private n: IMapping;

  constructor(mapping?: IMapping) {
    this.n = mapping ? mapping : ({} as IMapping);
  }

  public uuid(uuid: string): MappingBuilder {
    this.n.uuid = uuid;
    return this;
  }

  public name(name: string): MappingBuilder {
    this.n.name = name;
    return this;
  }

  public properties(properties: IMappingProperties): MappingBuilder {
    this.n.properties = properties;
    return this;
  }

  public build(): IMapping {
    return this.n;
  }
}
