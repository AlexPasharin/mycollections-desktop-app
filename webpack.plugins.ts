import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import { EnvironmentPlugin } from 'webpack';

export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new EnvironmentPlugin({
    DATABASE_URL: process.env['DATABASE_URL'],
  }),
];
