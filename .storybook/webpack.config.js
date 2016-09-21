const defaultConfigFunc = require('@kadira/storybook/dist/server/config/defaults/webpack.config');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';

function configure(base) {
  const config = defaultConfigFunc(base);
  config.devtool = isProduction ? 'source-map' : 'eval-source-map';
  config.plugins.push(
    new CopyWebpackPlugin(
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
    )
  );
  return config;
}

module.exports = configure;
