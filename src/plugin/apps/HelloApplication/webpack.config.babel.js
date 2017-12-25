/* eslint import/no-extraneous-dependencies: [error, {devDependencies: true}] */

import path from 'path';
import webpack from 'webpack';

const isProduction = process.env.NODE_ENV === 'production';

const js = {
  entry: {
    plugin_app_hello: ['./src/HelloApplication.jsx'],
  },
  output: {
    path: path.resolve('build'),
    filename: '[name].js',
  },
  devServer: {
    contentBase: 'build',
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
  },
  devtool: 'source-map',
  externals: {
    react: 'React',
    'prop-types': 'PropTypes',
    'js-yaml': 'JsYaml',
    lodash: 'Lodash',
  },
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
      {
        test: /\.jsx$/,
        include: path.resolve('src'),
        use: {
          loader: 'babel-loader',
          query: {
            presets: ['react', 'env'],
            plugins: [
              ...(isProduction ? [
                'transform-react-remove-prop-types',
              ] : []),
            ],
          },
        },
      },
    ],
  },
};

export default js;
