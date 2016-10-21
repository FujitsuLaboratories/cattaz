const defaultConfigFunc = require('@kadira/storybook/dist/server/config/defaults/webpack.config');

const WebpackUtil = require('../webpack.util');

const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';

function configure(base) {
  const config = defaultConfigFunc(base);
  config.devtool = isProduction ? 'source-map' : 'eval-source-map';
  WebpackUtil.enableVSCode(config);
  config.resolve.extensions.push('.jsx');
  return config;
}

module.exports = configure;
