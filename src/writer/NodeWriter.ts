// External dependencies
import * as UUID from "uuid";

// Hyperdoc
import { ExecutionContext } from "../ExecutionContext";

// Hyperdoc models
import { Node, NodeProperties, NodeId, NodeStateName, NodeState } from "../model/Node";
import { Mapping } from "../model/Mapping";

// Hyperdoc model schemas
import { SchemaValidator } from "../validation/SchemaValidator";
import { NodePropertiesSchema } from "../validation/schemas/NodeSchema";

// Hyperdoc aggregates
import { NodeAggregate } from "../aggregate/NodeAggregate";

// Hyperdoc readers
import { MappingReader } from "../reader/MappingReader";
import { NodeReader } from "../reader/NodeReader";

import { NodeWriterError } from "./NodeWriterError";

/**
 * Service to manage nodes from the user space.
 */
export class NodeWriter {
  /**
   * Create a new node.
   *
   * @param context Execution context
   * @param mappingName Name of the mapping
   * @param properties Node properties
   *
   * @returns A promise that resolves the node just created
   */
  public static create(context: ExecutionContext, mappingName: string, properties: NodeProperties): Promise<Node> {
    // TODO check permissions

    // new node UUID
    const nodeId = UUID.v1();

    return MappingReader.getByName(context, mappingName).then((mappingOpt) => {
      // validate properties
      const mapping = mappingOpt.fold(undefined, (m) => m);
      NodeWriter.validateNodeProperties(properties, mapping);

      // invoke create() in the aggregate. New state must be "Enabled"
      return NodeWriter.runAggregate(nodeId)((aggregate) => aggregate.create(mappingName, properties), [
        NodeStateName.Enabled
      ]);
    });
  }

  /**
   * Set node properties.
   *
   * @param context Execution context
   * @param nodeId Node UUID
   * @param properties Node properties
   *
   * @returns A promise that resolves the node just updated
   */
  public static setProperties(context: ExecutionContext, nodeId: NodeId, properties: NodeProperties): Promise<Node> {
    // TODO check permissions

    // get the node to be updated
    return NodeReader.get(context, nodeId)
      .then((nodeOpt) => {
        // get the node mapping, or throw and error if the node does not exist
        return nodeOpt.foldL(
          () => {
            throw new NodeWriterError(`Node ${nodeId} does not exist`);
          },
          (node) => {
            return MappingReader.getByName(context, node.mappingName);
          }
        );
      })
      .then((mappingOpt) => {
        // validate properties
        const mapping = mappingOpt.fold(undefined, (m) => m);
        NodeWriter.validateNodeProperties(properties, mapping);

        // invoke setProperties() in the aggregate. New state must be "Enabled"
        return NodeWriter.runAggregate(nodeId)((aggregate) => aggregate.setProperties(properties), [
          NodeStateName.Enabled
        ]);
      });
  }

  public static delete(context: ExecutionContext, nodeId: NodeId): Promise<Node> {
    // invoke delete() in the aggregate. New state must be "Deleted" and has no payload
    return NodeWriter.runAggregate(nodeId)((aggregate) => aggregate.delete(), [NodeStateName.Deleted], false);
  }

  public static enable(context: ExecutionContext, nodeId: NodeId): Promise<Node> {
    // invoke lock() in the aggregate. New state must be "Enabled"
    return NodeWriter.runAggregate(nodeId)((aggregate) => aggregate.enable(), [NodeStateName.Enabled]);
  }

  public static disable(context: ExecutionContext, nodeId: NodeId, reason: string): Promise<Node> {
    // invoke lock() in the aggregate. New state must be "Enabled"
    return NodeWriter.runAggregate(nodeId)((aggregate) => aggregate.disable(reason), [NodeStateName.Disabled]);
  }

  public static lock(context: ExecutionContext, nodeId: NodeId): Promise<Node> {
    // invoke lock() in the aggregate. New state must be "Locked"
    return NodeWriter.runAggregate(nodeId)((aggregate) => aggregate.lock(), [NodeStateName.Locked]);
  }

  public static unlock(context: ExecutionContext, nodeId: NodeId): Promise<Node> {
    // invoke lock() in the aggregate. New state must be "Enabled"
    return NodeWriter.runAggregate(nodeId)((aggregate) => aggregate.unlock(), [NodeStateName.Enabled]);
  }

  private static runAggregate(nodeId: NodeId): RunAggregateF {
    return (invoke: AggregateInvokeF, expectedStates: NodeStateName[], hasPayload: boolean = true) => {
      return NodeWriter.getAggregate(nodeId)
        .then((aggregate) => {
          return invoke(aggregate);
        })
        .then((nodeState) => {
          if (expectedStates.indexOf(nodeState.name) >= 0 && (!hasPayload || nodeState.node)) {
            return nodeState.node;
          } else {
            throw new NodeWriterError(`Node ${nodeId} is in an inconsistent state`);
          }
        });
    };
  }

  /**
   * Validate a node properties against a mapping.
   *
   * @param properties Node properties
   * @param mapping Mapping
   *
   * @throws An error if the validation doesn't pass
   */
  private static validateNodeProperties(properties: NodeProperties, mapping?: Mapping) {
    // get a validator for the mapping or default node validator if new mapping
    const validator = mapping
      ? SchemaValidator.getModelValidatorFromMapping(mapping)
      : SchemaValidator.getModelValidator();

    // validate node against the JSON schema and process errors
    const result = validator.validate(properties, NodePropertiesSchema);
    if (result.errors.length > 0) {
      throw new NodeWriterError(result.errors[0].message);
    }
  }

  private static getAggregate(nodeId: NodeId): Promise<NodeAggregate> {
    return NodeAggregate.build(nodeId);
  }
}

type AggregateInvokeF = (aggregate: NodeAggregate) => Promise<NodeState>;
type RunAggregateF = (invoke: AggregateInvokeF, expectedStates: NodeStateName[], hasPayload?: boolean) => Promise<Node>;
