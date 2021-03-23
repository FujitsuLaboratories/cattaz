// const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

function configure(baseConfig, mode) {
  const { config } = baseConfig;
  config.devtool = mode === 'PRODUCTION' ? 'source-map' : 'eval-source-map';
  config.resolve.extensions.push('.jsx');
  config.plugins.push(new CopyWebpackPlugin({
    patterns: [
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
        to: 'codemirror-theme/[name].[ext]',
      },
    ],
  }));
  /*
  // FIXME Not working?
  config.plugins.push(new webpack.DefinePlugin({
    'process.env.PORT': process.env.PORT || '8080',
  }));
  */
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
