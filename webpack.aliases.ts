import path from "path";

import tsconfig from "./tsconfig.json";

/**
 * Converts tsconfig.json paths to a Webpack-compatible aliases object.
 *
 * NOTE: npm package "tsconfig-paths-webpack-plugin" is supposed to do this, but for some reason I could not get it to work with this app setting's
 */
const convertTsconfigPathsToAliases = () => {
  const { paths, baseUrl } = tsconfig.compilerOptions;

  const aliases: Record<string, string> = {};

  // Loop through each path in the tsconfig
  for (const [key, [item]] of Object.entries(paths)) {
    // Get the aliases key (e.g., '@') by removing the trailing '/*'
    const aliasKey = key.replace("/*", "");

    // Get the path value and remove its trailing '/*'
    const value = item?.replace("/*", "") ?? "";

    // Create the full, absolute path and add it to the aliases object
    aliases[aliasKey] = path.resolve(__dirname, baseUrl, value);
  }

  return aliases;
};

const aliases = convertTsconfigPathsToAliases();

export default aliases;
