//Setup web server and socket
var twitter = require('twitter'),
    express = require('express'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);
    key_word='';


//Setup twitter stream api
var twit = new twitter({
  consumer_key: 'kDoDjz2IZbOkLrzmNF5mrfTgr',
  consumer_secret: '3KuoFjLbHtWOQc2Q586kqjSDV9CNhzrZ1X7S8uUf2IXKBJG7Xv',
  access_token_key: '494922433-Yih18h5VMiqqXra6kJWb5t8I5F187PHBjPwGM1uN',
  access_token_secret: '4l4z4JHHeazVMD0xla9XStG9IbWGWn4MYqQ2AzEalwBco'
});

app.use(express.static(__dirname + '/public'));

app.listen(8081);

app.get('/getJson', function (req, res) {
    key_word=req.query["selectpicker"];
    console.log(key_word);
});

//Create web sockets connection.
io.sockets.on('connection', function (socket) {
  socket.on("start tweets", function() {
    if(stream === null) {
        client.stream('statuses/filter', {track: 'javascript',language:'en',location:'-180,-90,180,90'}, function(stream) {
            stream.on('data', function(event) {
                console.log(event && event.text);
                socket.emit('twitter-stream', outputPoint);
            });

            stream.on('error', function(error) {
                throw error;
            });
        });
    }
  });
  // Emits signal to the client telling them that the
  // they are connected and can start receiving Tweets
  socket.emit("connected");
});
