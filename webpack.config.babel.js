/* eslint import/no-extraneous-dependencies: [error, {devDependencies: true}] */

import path from 'path';
import webpack from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';

import WebpackUtil from './webpack.util';

const isProduction = process.env.NODE_ENV === 'production';

const js = {
  entry: [
    './src/index.jsx',
  ],
  output: {
    path: 'build',
    filename: 'bundle.js',
  },
  devServer: {
    contentBase: 'build',
  },
  resolve: {
    extensions: ['', '.js', '.jsx', '.json'],
  },
  devtool: 'source-map',
  plugins: [
    new CopyWebpackPlugin(
      [
        {
          from: 'src/index.html',
          to: '',
        },
      ]
    ),
    ...(isProduction ? [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
        },
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
      }),
      new webpack.optimize.OccurrenceOrderPlugin(),
      new webpack.optimize.DedupePlugin(),
    ] : []),
  ],
  module: {
    preLoaders: [
      {
        test: /\.jsx?$/,
        include: path.resolve('src'),
        loader: 'eslint',
      },
    ],
    loaders: [
      {
        test: /\.js$/,
        include: path.resolve('src'),
        loader: 'babel',
        query: {
          presets: ['es2015'],
        },
      },
      {
        test: /\.jsx$/,
        include: path.resolve('src'),
        loader: 'babel',
        query: {
          presets: ['react', 'es2015'],
        },
      },
      {
        test: /\.json$/,
        loader: 'json',
      },
    ],
  },
};

WebpackUtil.enableVSCode(js);

export default js;
