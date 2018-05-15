import { ExecutionContext } from "../model/ExecutionContext";

const PERMISSIONS = [
  {
    effect: "Allow",
    resource: "organization:*",
    actions: ["data:Create"]
  }
];

export default class PermissionService {
  public static hasPermission(context: ExecutionContext, resource: string, action: string) {
    // TODO throw a permission exception if the user is not allowed
  }
}
