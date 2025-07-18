// import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import type { Configuration } from "webpack";

import path from "path";

import { plugins } from "./webpack.plugins";
import { rules } from "./webpack.rules";

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: "./src/index.ts",

  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins,
  resolve: {
    alias: {
      "@/api": path.resolve(__dirname, "src/api"),
      "@/app": path.resolve(__dirname, "src/app"),
      "@/db": path.resolve(__dirname, "src/db"),
      "@/prisma": path.resolve(__dirname, "prisma"),
      "@/types": path.resolve(__dirname, "src/types"),
    },
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css", ".json"],

    // plugins: [
    //   new TsconfigPathsPlugin({
    //     configFile: "./tsconfig.json",
    //   }),
    // ],
  },
};
