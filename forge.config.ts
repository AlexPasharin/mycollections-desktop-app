import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { WebpackPlugin } from "@electron-forge/plugin-webpack";
import type { ForgeConfig } from "@electron-forge/shared-types";
import dotenv from "dotenv";

import windows from "./appWindows";
import { mainConfig } from "./webpack.main.config";
import { rendererConfig } from "./webpack.renderer.config";

dotenv.config();

/** Webpack dev server port for `yarn start`. Override with WEBPACK_DEV_PORT (e.g. in `.env`). */
function webpackDevPort(): number {
  const raw = process.env["WEBPACK_DEV_PORT"];

  if (raw === undefined || raw === "") {
    return 3000;
  }

  const n = Number.parseInt(raw, 10);

  return Number.isFinite(n) && n > 0 && n <= 65_535 ? n : 3000;
}

/**
 * Forge web-multi-logger port (webpack build output in the browser). Defaults to 9000.
 * If `yarn start` fails with EADDRINUSE on 9000, set WEBPACK_LOGGER_PORT to a free port.
 */
function webpackLoggerPort(): number {
  const raw = process.env["WEBPACK_LOGGER_PORT"];

  if (raw === undefined || raw === "") {
    return 9000;
  }

  const n = Number.parseInt(raw, 10);

  return Number.isFinite(n) && n > 0 && n <= 65_535 ? n : 9000;
}

const entryPoints = Object.entries(windows).map(([name, { folder }]) => ({
  name,
  js: `./src/app/${folder}/renderer.tsx`,
  preload: {
    js: `./src/app/${folder}/preload.ts`,
  },
  html: "./src/public/main.html",
}));

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new AutoUnpackNativesPlugin({}),
    new WebpackPlugin({
      port: webpackDevPort(),
      loggerPort: webpackLoggerPort(),
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints,
      },
    }),

    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
