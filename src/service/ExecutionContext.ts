import { AggregateConfig } from "eventum-sdk";

export interface AuthenticationContext {
  userUuid: string;
}

export interface ExecutionContext {
  auth: AuthenticationContext;
}
