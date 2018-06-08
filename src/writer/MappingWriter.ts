// External dependencies
import * as UUID from "uuid";

// Hyperdoc
import { ExecutionContext } from "../ExecutionContext";

// Hyperdoc models
import { Mapping, MappingProperties, MappingId, MappingStateName, MappingState } from "../model/Mapping";

// Hyperdoc aggregates
import { MappingAggregate, IMappingAggregate } from "../aggregate/MappingAggregate";

// Hyperdoc readers
import { MappingReader } from "../reader/MappingReader";

// Hyperdoc validation
import { SchemaValidator } from "../validation/SchemaValidator";

import { MappingWriterError } from "./MappingWriterError";
/**
 * Service to manage mappings from the user space.
 */
export class MappingWriter {
  /**
   * Create a new mapping.
   *
   * @param context Execution context
   * @param name Mapping name
   * @param properties Mapping properties
   *
   * @returns A promise that resolves the mapping just created
   */
  public static create(context: ExecutionContext, name: string, properties: MappingProperties): Promise<Mapping> {
    // TODO check permissions

    // validation
    MappingWriter.validateMappingName(name);
    MappingWriter.validateMappingProperties(properties);

    //  new mapping UUID
    const mappingId: MappingId = UUID.v1();

    return MappingReader.getByName(context, name).then((mappingOpt) => {
      return mappingOpt.foldL(
        () => {
          // invoke create() in the aggregate. New state must be "Enabled"
          return MappingWriter.runAggregate(mappingId)((aggregate) => aggregate.create(name, properties), [
            MappingStateName.Enabled
          ]);
        },
        (_) => {
          // throw an error if a mapping with the same name already exists
          throw new MappingWriterError(`Mapping ${name} already exists`);
        }
      );
    });
  }

  /**
   * Set mapping properties.
   *
   * @param context Execution context
   * @param mappingId Mapping uuid
   * @param properties Mapping properties
   *
   * @returns A promise that resolves the mapping just updated
   */
  public static setProperties(
    context: ExecutionContext,
    mappingId: MappingId,
    properties: MappingProperties
  ): Promise<Mapping> {
    // TODO check permissions

    // validation
    MappingWriter.validateMappingProperties(properties);

    // invoke setProperties() in the aggregate. New state must be "Enabled"
    return MappingWriter.runAggregate(mappingId)((aggregate) => aggregate.setProperties(properties), [
      MappingStateName.Enabled
    ]);
  }

  private static runAggregate(mappingId: MappingId): RunAggregateF {
    return (invoke: AggregateInvokeF, expectedStates: MappingStateName[], hasPayload: boolean = true) => {
      return MappingWriter.getAggregate(mappingId)
        .then((aggregate) => {
          return invoke(aggregate);
        })
        .then((mappingState) => {
          if (expectedStates.indexOf(mappingState.name) >= 0 && (!hasPayload || mappingState.mapping)) {
            return mappingState.mapping;
          } else {
            throw new MappingWriterError(`Mapping ${mappingId} is in an inconsistent state`);
          }
        });
    };
  }

  private static getAggregate(mappingId: MappingId): Promise<IMappingAggregate> {
    return MappingAggregate.build(mappingId);
  }

  private static validateMappingName(name: string): void {
    // validate mapping name against the JSON schema and process errors
    const result = SchemaValidator.validateMappingName(name);
    if (result.errors.length > 0) {
      throw new MappingWriterError(result.errors[0].message);
    }
  }

  private static validateMappingProperties(properties: MappingProperties): void {
    // validate mapping properties against the JSON schema and process errors
    const result = SchemaValidator.validateMappingProperties(properties);
    if (result.errors.length > 0) {
      throw new MappingWriterError(result.errors[0].message);
    }
  }
}

type AggregateInvokeF = (aggregate: IMappingAggregate) => Promise<MappingState>;
type RunAggregateF = (
  invoke: AggregateInvokeF,
  expectedStates: MappingStateName[],
  hasPayload?: boolean
) => Promise<Mapping>;
