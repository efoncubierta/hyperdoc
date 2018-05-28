import * as deepmerge from "deepmerge";
import { HyperdocConfig, HyperdocProvider, HyperdocConfigDefault } from "./config/HyperdocConfig";

export class Hyperdoc {
  private static defaultConfig: HyperdocConfig = HyperdocConfigDefault;
  private static currentConfig: HyperdocConfig = HyperdocConfigDefault;

  public static config(config?: HyperdocConfig): HyperdocConfig {
    if (config) {
      Hyperdoc.currentConfig = deepmerge.all([Hyperdoc.currentConfig, config]);
    }

    return Hyperdoc.currentConfig;
  }

  public static resetConfig(): void {
    Hyperdoc.currentConfig = Hyperdoc.defaultConfig;
  }
}
