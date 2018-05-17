import { AggregateConfig } from "hyperdoc-eventstore";

export interface AuthenticationContext {
  userUuid: string;
}

export interface AggregateContext {
  config: AggregateConfig;
}

export interface ExecutionContext {
  auth: AuthenticationContext;
  aggregate: AggregateContext;
}
