const path = require('path');

const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV;

const buildPath = path.join(__dirname, 'build/');
const extensionPath = path.join(__dirname, 'extension/');

// This webpack configuration builds processes javascript files with Babel and
// bulk-copies static assets to the build/ directory when appropriate.

if (NODE_ENV !== 'production') {
  module.exports.devtool = 'source-map';
}

module.exports.entry = {
  background: path.join(extensionPath, 'scripts/background.js'),
  content: path.join(extensionPath, 'scripts/content.js'),
  popup: path.join(extensionPath, 'scripts/popup.js'),
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
    from: path.join(extensionPath, 'static/images/'),
    to: path.join(buildPath, 'images/'),
  },
]));
module.exports.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());

if (NODE_ENV === 'production') {
  module.exports.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compressor: {
      screw_ie8: true,
      warnings: false,
    },
    mangle: {
      screw_ie8: true,
    },
    output: {
      comments: false,
      screw_ie8: true,
    },
  }));
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
  exclude: /node_modules/,
  query: {
    presets: ['react-optimize'],
  },
});
