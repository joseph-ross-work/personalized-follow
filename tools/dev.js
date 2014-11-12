var express = require('express');
var lessMiddleware = require('less-middleware');
var path = require('path');
var webpack = require('webpack');
var webpackMiddleware = require("webpack-dev-middleware");
var webpackConfig = require('../webpack.config.js');

var app = express();
var compiler = webpack(webpackConfig);
var publicPath = path.join(__dirname, '/../');

app.configure(function(){
  // Webpack middleware
  app.use(webpackMiddleware(compiler, {
    stats: {
      colors: true
    },
    publicPath: '/dist/'
  }));

  app.use(lessMiddleware('/src/less', {
    pathRoot: publicPath,
    dest: '/dist/css',
    force: true,
    parser: {
      paths: [publicPath]
    }
  }));

  app.use('/', express.static(publicPath));
  app.use('/dist/css/fonts', express.static(path.join(publicPath, 'lib/livefyre-bootstrap/dist/fonts')));
  //app.use('/dist/img', express.static(path.join(publicPath, 'src/img')));
});

app.listen(8001);
