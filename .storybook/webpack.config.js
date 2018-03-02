const CopyWebpackPlugin = require('copy-webpack-plugin');

const defaultConfigFunc = require('@storybook/react/dist/server/config/defaults/webpack.config');

const environment = process.env.NODE_ENV;
const isProduction = environment === 'production';

function configure(base) {
  const config = defaultConfigFunc(base);
  config.entry.preview.unshift('babel-polyfill'); // required by async/await
  config.devtool = isProduction ? 'source-map' : 'eval-source-map';
  config.resolve.extensions.push('.jsx');
  config.plugins.push(new CopyWebpackPlugin([
    {
      from: 'src/cattaz.css',
      to: '',
    },
    {
      from: 'node_modules/codemirror/lib/codemirror.css',
      to: '',
    },
    {
      from: 'node_modules/codemirror/theme/*.css',
      to: 'codemirror-theme',
      flatten: true,
    },
  ]));
  // Disable default loaders for css defnied by storybook.
  config.module.rules.forEach((l) => {
    if (l.test.source === '\\.css$') {
      // eslint-disable-next-line no-param-reassign
      l.exclude = /github-markdown\.css/;
    }
  });
  config.module.rules.push({
    test: /github-markdown.css$/,
    use: [
      {
        loader: 'file-loader',
        options: {
          name: 'github-markdown-md-only.css',
        },
      },
      {
        loader: 'postcss-loader',
      },
    ],
  });
  return config;
}

module.exports = configure;
