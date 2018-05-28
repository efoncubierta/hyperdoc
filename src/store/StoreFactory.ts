import { Hyperdoc } from "../Hyperdoc";
import { HyperdocProvider } from "../config/HyperdocConfig";

// stores
import { MappingStore } from "./MappingStore";
import { NodeStore } from "./NodeStore";
import { MappingDynamoDBStore } from "./aws/MappingDynamoDBStore";
import { NodeDynamoDBStore } from "./aws/NodeDynamoDBStore";

export class StoreFactory {
  private static mappingDynamoDBStore: MappingStore;
  private static nodeDynamoDBStore: NodeStore;

  public static getMappingStore(): MappingStore {
    switch (Hyperdoc.config().provider) {
      case HyperdocProvider.AWS:
        if (!this.mappingDynamoDBStore) {
          this.mappingDynamoDBStore = new MappingDynamoDBStore();
        }
        return this.mappingDynamoDBStore;
      default:
        throw new Error(`MappingStore not available for ${Hyperdoc.config().provider}`);
    }
  }

  public static getNodeStore(): NodeStore {
    switch (Hyperdoc.config().provider) {
      case HyperdocProvider.AWS:
        if (!this.nodeDynamoDBStore) {
          this.nodeDynamoDBStore = new NodeDynamoDBStore();
        }
        return this.nodeDynamoDBStore;
      default:
        throw new Error(`NodeStore not available for ${Hyperdoc.config().provider}`);
    }
  }
}
