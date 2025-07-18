// import { TsconfigPathsPlugin } from "tsconfig-paths-webpack-plugin";
import type { Configuration } from "webpack";

import path from "path";

import { plugins } from "./webpack.plugins";
import { rules } from "./webpack.rules";

rules.push({
  test: /\.css$/,
  use: [{ loader: "style-loader" }, { loader: "css-loader" }],
});

export const rendererConfig: Configuration = {
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
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],

    // plugins: [
    //   new TsconfigPathsPlugin({
    //     configFile: "./tsconfig.json",
    //   }),
    // ],
  },
};
