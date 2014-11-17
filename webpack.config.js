var path = require('path');
var pkg = require('./package.json');
var webpack = require('webpack');
var LivefyreizeWrapper = require('livefyreize-template-plugin');

var debug = true;

process.argv.forEach(function (arg) {
  arg = arg.replace('--', '');
  if (arg.indexOf('debug') > -1) {
    debug = arg.split('=')[1] === 'true';
  }
});

module.exports = {
  debug: debug,
  entry: {
      'personalized-follow': [path.join(__dirname, 'src', 'js', 'index.js')]
  },
  resolve: {
      modulesDirectories: [
        path.join(__dirname, 'node_modules'),
        path.join(__dirname, 'lib')
      ],
      alias: {
        less: path.join(__dirname, 'node_modules', 'less', 'dist', 'less-1.6.0.js'),
        "livefyre-auth": path.join(__dirname, 'lib', 'livefyre-auth', 'src', 'main.js'),
        mout: path.join(__dirname, 'node_modules', 'mout', 'src'),
        auth: path.join(__dirname, 'lib', 'auth', 'src', 'main.js')
      }
  },
  output: {
      path: path.join(__dirname, 'dist'),
      filename: '[name].min.js',
  },
  module: {
    loaders: [
      {test: /\.hb$/, loader: 'handlebars-loader' },
      {test: /\.css$/, loader: 'style-loader!css-loader'},
      {test: /\.less$/,loader: 'style-loader!css-loader!less-loader?root=../../../../'},
      {test: /\.woff$/, loader: 'url-loader'},
      {test: /\.eot$/, loader: 'url-loader'},
      {test: /\.ttf$/, loader: 'url-loader'},
      {test: /\.svg$/, loader: 'url-loader'},
      {test: /\.gif$/, loader: 'url-loader'},
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
        VERSION: JSON.stringify(pkg.version)
    }),
    new LivefyreizeWrapper(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    })
  ]
};
