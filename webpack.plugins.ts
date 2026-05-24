import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import { EnvironmentPlugin } from "webpack";

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: "webpack-infrastructure",
  }),
  new EnvironmentPlugin({
    LOCAL_DEV_DB_URL: process.env["LOCAL_DEV_DB_URL"],
    LOCAL_PROD_DB_URL: process.env["LOCAL_PROD_DB_URL"],
    REMOTE_PROD_DB_URL: process.env["REMOTE_PROD_DB_URL"],
  }),
];
