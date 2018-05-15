import { NodeProperties } from "../../model/Node";

export default interface CreateNodeCommand {
  mappingName: string;
  properties: NodeProperties;
}
