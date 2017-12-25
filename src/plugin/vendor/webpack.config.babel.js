/* eslint import/no-extraneous-dependencies: [error, {devDependencies: true}] */

import path from 'path';
import webpack from 'webpack';

const isProduction = process.env.NODE_ENV === 'production';

const js = {
  entry: {
    plugin_vendor: ['./src/vendor.js'],
  },
  output: {
    path: path.resolve('build'),
    filename: '[name].js',
  },
  devServer: {
    contentBase: 'build',
  },
  resolve: {
    extensions: ['.js'],
  },
  devtool: 'source-map',
  plugins: [
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
      new webpack.optimize.ModuleConcatenationPlugin(),
    ] : []),
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.resolve('src'),
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['env'],
          },
        },
      },
    ],
  },
};

export default js;
