import IMappingStore from "../store/IMappingStore";
import INodeStore from "../store/INodeStore";

export interface IAuthenticationContext {
  userUuid: string;
}

export interface IStoresContext {
  mappings: IMappingStore;
  nodes: INodeStore;
}

export interface IExecutionContext {
  auth: IAuthenticationContext;
  stores: IStoresContext;
}
