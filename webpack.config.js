const path = require('path');

const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');

const NODE_ENV = process.env.NODE_ENV;
const IS_PRODUCTION = NODE_ENV === 'production';

const buildPath = path.join(__dirname, 'build/');
const extensionPath = path.join(__dirname, 'extension/');
const scriptsPath = path.join(extensionPath, 'scripts/');
const browserPath = path.join(scriptsPath, 'browser/');

// This webpack configuration builds javascript files with Babel and bulk-copies
// static assets to the build/ directory when appropriate.

if (IS_PRODUCTION) {
  module.exports.devtool = 'source-map';
}

module.exports.entry = {
  background: path.join(browserPath, 'background.js'),
  content: path.join(browserPath, 'content.js'),
  popup: path.join(browserPath, 'popup.js'),
  index: path.join(browserPath, 'index.js'),
};

module.exports.output = {
  path: path.join(buildPath, 'scripts/'),
  filename: '[name].js',
  chunkFilename: '[id].chunk.js',
};

module.exports.plugins = [];

// Update access/modification time of .last-build file whenever we build. On my
// virtual machine I will use inotifywait to rsync the extension back through
// the host's shared directory.
module.exports.plugins.push(new WebpackShellPlugin({
  onBuildExit: ['touch .last-build'],
}));

module.exports.plugins.push(new CleanWebpackPlugin([buildPath]));
module.exports.plugins.push(new CopyWebpackPlugin([
  // Extension manifest.
  {
    from: path.join(extensionPath, 'static/manifest.json'),
    to: buildPath,
  },
  // HTML pages.
  {
    from: path.join(extensionPath, 'static/pages/'),
    to: path.join(buildPath, 'pages/'),
  },
  // Style sheets.
  {
    from: path.join(extensionPath, 'static/styles/'),
    to: path.join(buildPath, 'styles/'),
  },
  // Images.
  {
    from: path.join(extensionPath, 'static/images/plum/'),
    to: path.join(buildPath, 'images/plum/'),
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

module.exports.module.loaders.push({
  test: /\.vue$/,
  loader: 'vue-loader',
  include: [scriptsPath],
});
