import type { Configuration } from "webpack";

import aliases from "./webpack.aliases";
import { plugins } from "./webpack.plugins";
import { rules } from "./webpack.rules";

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/main.ts",
  module: {
    rules,
  },
  plugins,
  resolve: {
    alias: aliases,
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],
  },
};
