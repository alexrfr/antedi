
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var logfmt = require('logfmt');
var path = require('path');
require('./models');

var app = express();

// modulos
var home = require('./controllers/home');
var articulo = require('./controllers/articulo');

// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/layouts');
app.set('view engine', 'jade');
app.use(logfmt.requestLogger());
app.use(express.favicon('/public/images/favicon.ico'));
app.use(express.logger('dev'));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + "/public/tmpPhotos" }));
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler()); 
}

// rutas
app.use(home);
app.use(articulo);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
