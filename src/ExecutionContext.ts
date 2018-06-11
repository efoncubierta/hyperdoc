export interface AuthenticationContext {
  userHrn: string;
}

export interface ExecutionContext {
  auth: AuthenticationContext;
}
