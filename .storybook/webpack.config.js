const defaultConfigFunc = require('@kadira/storybook/dist/server/config/defaults/webpack.config');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';

function configure(base) {
  const config = defaultConfigFunc(base);
  config.devtool = isProduction ? 'source-map' : 'eval-source-map';
  config.plugins.push(
    new CopyWebpackPlugin([
      {
        from: `node_modules/monaco-editor/${isProduction ? 'min' : 'dev'}/vs`,
        to: 'vs',
      },
    ])
  );
  return config;
}

module.exports = configure;
