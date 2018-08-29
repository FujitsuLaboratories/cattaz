/* eslint import/no-extraneous-dependencies: [error, {devDependencies: true}] */

import path from 'path';
import webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const isProduction = process.env.NODE_ENV === 'production';

const js = {
  mode: isProduction ? 'production' : 'development',
  entry: [
    '@babel/polyfill',
    'whatwg-fetch',
    './src/index.jsx',
    ...(isProduction ? [] : [
      'webpack-hot-middleware/client',
    ]),
  ],
  output: {
    path: path.resolve('build'),
    filename: 'bundle.js',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  devtool: 'source-map',
  plugins: [
    new CopyWebpackPlugin([
      {
        from: 'LICENSE',
        to: 'LICENSE.txt',
      },
      {
        from: 'src/index.html',
        to: '',
      },
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
    ]),
    new webpack.DefinePlugin({
      'process.env.PORT': process.env.PORT || '8080',
    }),
    ...(isProduction ? [] : [
      new webpack.HotModuleReplacementPlugin(),
    ]),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: path.resolve('src'),
        loader: 'eslint-loader',
        enforce: 'pre',
        options: {
          emitWarning: !isProduction,
        },
      },
      {
        test: /\.js$/,
        include: path.resolve('src'),
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        // For yjs
        test: /\.es6$/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.jsx$/,
        include: path.resolve('src'),
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['@babel/preset-react', '@babel/preset-env'],
            plugins: [
              ...(isProduction ? [
                'transform-react-remove-prop-types',
              ] : []),
            ],
          },
        },
      },
      {
        test: /\.(png|svg)$/,
        use: {
          loader: 'file-loader',
          query: {
            name: '[name]-[hash:hex:8].[ext]',
          },
        },
      },
      {
        test: /\.cattaz.md$/,
        use: {
          loader: 'file-loader',
          query: {
            name: 'docs/[name]-[hash:hex:8].[ext]',
          },
        },
      },
      {
        test: /github-markdown.css$/,
        use: [
          {
            loader: 'file-loader',
            query: {
              name: 'github-markdown-md-only.css',
            },
          },
          {
            loader: 'postcss-loader',
          },
        ],
      },
    ],
  },
};

export default js;
