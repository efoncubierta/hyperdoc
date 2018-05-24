// external dependencies
import * as faker from "faker";
import { AggregateConfig, Command } from "eventum-sdk";

// hyperdoc-backend dependencies
import { AuthenticationContext, ExecutionContext } from "../../src/service/ExecutionContext";
import {
  CreateMapping,
  DeleteMapping,
  DeleteNode,
  GetMapping,
  GetNode,
  SetMappingProperties,
  SetNodeProperties,
  CreateNode
} from "../../src";

// cross project reference
import { TestDataGenerator } from "../../../core/test/util/TestDataGenerator";

export class TestBackendDataGenerator extends TestDataGenerator {
  public static randomCreateMapping(mappingName?: string): CreateMapping {
    return new CreateMapping(mappingName || this.randomMappingName(), this.randomMappingProperties());
  }

  public static randomCreateNode(mappingName?: string): CreateNode {
    return new CreateNode(mappingName || this.randomMappingName(), this.randomNodeProperties());
  }

  public static randomDeleteMapping(): DeleteMapping {
    return new DeleteMapping();
  }

  public static randomDeleteNode(): DeleteNode {
    return new DeleteNode();
  }

  public static randomGetMapping(): GetMapping {
    return new GetMapping();
  }

  public static randomGetNode(): GetNode {
    return new GetNode();
  }

  public static randomSetMappingProperties(): SetMappingProperties {
    return new SetMappingProperties(this.randomMappingProperties());
  }

  public static randomSetNodeProperties(): SetNodeProperties {
    return new SetNodeProperties(this.randomNodeProperties());
  }

  public static randomNotSupportedCommand(): Command {
    return {
      messageType: "Command",
      commandType: "NotSupportedCommand"
    };
  }

  public static randomAuthenticationContext(): AuthenticationContext {
    return {
      userUuid: TestDataGenerator.randomUUID()
    };
  }

  public static randomExecutionContext(): ExecutionContext {
    return {
      auth: this.randomAuthenticationContext(),
      aggregates: {
        mapping: {
          snapshot: {
            interval: 10
          }
        },
        node: {
          snapshot: {
            interval: 10
          }
        }
      }
    };
  }
}
