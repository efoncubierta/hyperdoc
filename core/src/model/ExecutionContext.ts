import MappingStore from "../store/MappingStore";
import NodeStore from "../store/NodeStore";

export interface AuthenticationContext {
  userUuid: string;
}

export interface StoresContext {
  mappings: MappingStore;
  nodes: NodeStore;
}

export interface ExecutionContext {
  auth: AuthenticationContext;
  stores: StoresContext;
}
