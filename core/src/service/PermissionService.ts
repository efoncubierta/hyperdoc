import { IExecutionContext } from "../model/IExecutionContext";

const PERMISSIONS = [
  {
    effect: "Allow",
    resource: "organization:*",
    actions: ["data:Create"]
  }
];

export default class PermissionService {
  public static hasPermission(context: IExecutionContext, resource: string, action: string) {
    // TODO throw a permission exception if the user is not allowed
  }
}
