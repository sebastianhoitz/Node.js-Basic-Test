
/**
 * Module dependencies.
 */

var express = require('express'),
	app = module.exports = express.createServer(), 
	io = require("socket.io").listen(app),
	twitter = require("twitter");

// Configuration

var twit = new twitter({
  consumer_key: '',
  consumer_secret: '',
  access_token_key: '',
  access_token_secret: ''
});

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

io.sockets.on('connection', function (socket) {
	socket.emit("message", { message: "Hey you!" });
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    //console.log(data);
  });

  socket.on("message", function(data) {
    io.sockets.emit("message", data);
  });
});

twit.stream('statuses/filter', {track: "or"}, function(stream) {
	var tweets = [];
  stream.on('data', function (data) {
		//console.log(data);
    tweets.push(data);
  });
  setInterval(function() {
    io.sockets.emit("new tweet", tweets.length);
    tweets = [];
  }, 500);
});

app.get('/', function(req, res){
  res.render('index', {
    title: 'Express'
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
