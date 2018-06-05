import * as deepmerge from "deepmerge";
import { HyperdocConfig, HyperdocProvider, HyperdocConfigDefault } from "./config/HyperdocConfig";

export class Hyperdoc {
  private static defaultConfig: HyperdocConfig = HyperdocConfigDefault;
  private static currentConfig: HyperdocConfig = HyperdocConfigDefault;

  public static config(config?: Partial<HyperdocConfig>): HyperdocConfig {
    if (config) {
      const newConfig = deepmerge.all([Hyperdoc.currentConfig, config]);
      // TODO implement schema validator for HyperdocConfig
      // const validationResult = SchemaValidator.validateEventumConfig(newConfig);
      // if (validationResult.throwError) {
      //   throw validationResult.errors[0];
      // }

      Hyperdoc.currentConfig = newConfig;
    }

    return Hyperdoc.currentConfig;
  }

  public static resetConfig(): void {
    Hyperdoc.currentConfig = Hyperdoc.defaultConfig;
  }
}
