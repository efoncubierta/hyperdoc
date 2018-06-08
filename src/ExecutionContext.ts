export interface AuthenticationContext {
  userUuid: string;
}

export interface ExecutionContext {
  auth: AuthenticationContext;
}
