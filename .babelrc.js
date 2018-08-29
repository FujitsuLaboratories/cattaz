const config = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
  ],
  plugins: [
    'react-hot-loader/babel',
  ],
  env: {
    test: {
      plugins: ['istanbul'],
    },
  },
};

module.exports = config;
