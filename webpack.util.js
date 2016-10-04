/* eslint import/no-extraneous-dependencies: [error, {devDependencies: true}] */

// This file is also required by './storybook/webpack.config.js'.
// Do not use ES6 import/export syntax.

const CopyWebpackPlugin = require('copy-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

class WebpackUtil {
  static enableVSCode(config) {
    config.plugins.push(new CopyWebpackPlugin(
      isProduction ? [
        {
          from: 'node_modules/monaco-editor/min',
          to: 'lib',
        },
        {
          from: 'node_modules/monaco-editor/min-maps',
          to: 'min-maps',
        },
      ] : [
        {
          from: 'node_modules/monaco-editor/dev',
          to: 'lib',
        },
      ]
    ));
  }
}

module.exports = WebpackUtil;
