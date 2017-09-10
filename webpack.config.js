const path = require('path');

const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV;
const IS_PRODUCTION = NODE_ENV === 'production';

const buildPath = path.join(__dirname, 'build/');
const extensionPath = path.join(__dirname, 'extension/');
const scriptsPath = path.join(extensionPath, 'scripts/');

// This webpack configuration builds javascript files with Babel and bulk-copies
// static assets to the build/ directory when appropriate.

if (IS_PRODUCTION) {
  module.exports.devtool = 'source-map';
}

module.exports.entry = {
  background: path.join(scriptsPath, 'background.js'),
  content: path.join(scriptsPath, 'content.js'),
  popup: path.join(scriptsPath, 'popup.js'),
};

module.exports.output = {
  path: path.join(buildPath, 'scripts/'),
  filename: '[name].js',
  chunkFilename: '[id].chunk.js',
};

module.exports.plugins = [];
module.exports.plugins.push(new CleanWebpackPlugin([buildPath]));
module.exports.plugins.push(new CopyWebpackPlugin([
  // Extension manifest.
  {
    from: path.join(extensionPath, 'static/manifest.json'),
    to: buildPath,
  },
  // HTML pages.
  {
    from: path.join(extensionPath, 'static/**/*.html'),
    context: path.join(extensionPath, 'static/'),
    to: path.join(buildPath, 'pages/'),
  },
  // Style sheets.
  {
    from: path.join(extensionPath, 'static/**/*.css'),
    context: path.join(extensionPath, 'static/'),
    to: path.join(buildPath, 'styles/'),
  },
  // Images.
  {
    from: path.join(extensionPath, 'static/images/purple_plum/'),
    to: path.join(buildPath, 'images/purple_plum/'),
  },
]));
module.exports.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());

if (IS_PRODUCTION) {
  module.exports.plugins.push(new MinifyPlugin());
}

module.exports.plugins.push(new webpack.DefinePlugin({
  'process.env': {
    NODE_ENV: JSON.stringify(NODE_ENV),
  },
}));

module.exports.module = {
  loaders: [],
};

module.exports.module.loaders.push({
  test: /\.js$/,
  loader: 'babel-loader',
  include: [scriptsPath],
});
