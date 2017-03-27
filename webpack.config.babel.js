/* eslint import/no-extraneous-dependencies: [error, {devDependencies: true}] */

import path from 'path';
import webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';

const isProduction = process.env.NODE_ENV === 'production';

const js = {
  entry: [
    'babel-polyfill',
    './src/index.jsx',
  ],
  output: {
    path: path.resolve('build'),
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: 'build',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  devtool: 'source-map',
  plugins: [
    new CopyWebpackPlugin(
      [
        {
          from: 'src/index.html',
          to: '',
        },
      ],
    ),
    ...(isProduction ? [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
        },
      }),
      new webpack.optimize.UglifyJsPlugin({
        sourceMap: true,
      }),
      new webpack.LoaderOptionsPlugin({
        minimize: true,
      }),
    ] : []),
  ],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: path.resolve('src'),
        loader: 'eslint-loader',
        enforce: 'pre',
      },
      {
        test: /\.js$/,
        include: path.resolve('src'),
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['es2015'],
          },
        },
      },
      {
        // For yjs
        test: /\.es6$/,
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['es2015'],
          },
        },
      },
      {
        test: /\.jsx$/,
        include: path.resolve('src'),
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['react', 'es2015'],
          },
        },
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },
};

export default js;
