const CopyWebpackPlugin = require('copy-webpack-plugin');

const defaultConfigFunc = require('@kadira/storybook/dist/server/config/defaults/webpack.config');

const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';

function configure(base) {
  const config = defaultConfigFunc(base);
  config.devtool = isProduction ? 'source-map' : 'eval-source-map';
  config.resolve.extensions.push('.jsx');
  config.plugins.push(new CopyWebpackPlugin([
    {
      from: 'src/cattaz.css',
      to: '',
    },
    {
      from: 'node_modules/github-markdown-css/github-markdown.css',
      to: '',
    },
  ]));
  return config;
}

module.exports = configure;
