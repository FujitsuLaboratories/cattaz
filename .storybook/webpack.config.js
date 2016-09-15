const defaultConfigFunc = require('@kadira/storybook/dist/server/config/defaults/webpack.config');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function configure(base) {
  const config = defaultConfigFunc(base);
  config.plugins.push(
    new CopyWebpackPlugin([
      {
        from: 'node_modules/monaco-editor/min/vs',
        to: 'vs',
      },
    ])
  );
  return config;
}

module.exports = configure;
