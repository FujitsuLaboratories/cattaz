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
  ]));
  // Disable default loaders for css defnied by storybook.
  config.module.loaders.forEach((l) => {
    if (l.test.source === '\\.css?$') {
      l.exclude = /github-markdown-css/;
    }
  });
  config.module.loaders.push({
    test: /github-markdown.css$/,
    loaders: [
      'file-loader?name=github-markdown-md-only.css',
      'postcss-loader',
    ],
  });
  return config;
}

module.exports = configure;
