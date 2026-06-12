import type { Configuration } from "webpack";

import aliases from "./webpack.aliases";
import { plugins } from "./webpack.plugins";
import { rules } from "./webpack.rules";

export const rendererConfig: Configuration = {
  module: {
    rules: [
      ...rules,
      {
        test: /\.module\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-modules-typescript-loader" },
          { loader: "css-loader", options: { modules: true } },
        ],
      },
      {
        test: /\.css$/,
        exclude: /\.module\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" },
          { loader: "postcss-loader" },
        ],
      },
    ],
  },
  plugins,
  resolve: {
    alias: aliases,
    extensions: [".js", ".ts", ".jsx", ".tsx", ".css"],
  },
};
