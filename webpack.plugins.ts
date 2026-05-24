import ForkTsCheckerWebpackPlugin from "fork-ts-checker-webpack-plugin";
import { EnvironmentPlugin } from "webpack";

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: "webpack-infrastructure",
  }),

  // Packaged app has no runtime .env — forge loads .env at build time (forge.config.ts)
  // This plugin inlines these keys into the main bundle for packaged builds.
  // For development, this is not needed because the .env file is loaded at runtime.
  // Must stay in sync with
  // literal process.env["…"] reads in src/config/database-urls.ts (dynamic keys won't work).
  new EnvironmentPlugin({
    LOCAL_DEV_DB_URL: process.env["LOCAL_DEV_DB_URL"],
    LOCAL_PROD_DB_URL: process.env["LOCAL_PROD_DB_URL"],
    REMOTE_PROD_DB_URL: process.env["REMOTE_PROD_DB_URL"],
  }),
];
