import { AggregateConfig } from "eventum-sdk";

export interface AuthenticationContext {
  userUuid: string;
}

export interface AggregatesContext {
  node: AggregateConfig;
  mapping: AggregateConfig;
}

export interface ExecutionContext {
  auth: AuthenticationContext;
  aggregates: AggregatesContext;
}
