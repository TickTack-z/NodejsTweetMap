var twitter = require('twit'),
    express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);
var request=require('request');

//Setup twitter stream api
var twit = new twitter({
  consumer_key: 'kDoDjz2IZbOkLrzmNF5mrfTgr',
  consumer_secret: '3KuoFjLbHtWOQc2Q586kqjSDV9CNhzrZ1X7S8uUf2IXKBJG7Xv',
  access_token: '494922433-Yih18h5VMiqqXra6kJWb5t8I5F187PHBjPwGM1uN',
  access_token_secret: '4l4z4JHHeazVMD0xla9XStG9IbWGWn4MYqQ2AzEalwBco'
});

//Use the default port (for beanstalk) or default to 8081 locally
server.listen(process.env.PORT || 8081);

//Setup routing for app
app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

var stream=twit.stream('statuses/filter', {track:['love','football',"food"],language:'en',location:'-180,-90,180,90'});
var key_word="love";
app.get('/getJson', function (req, res) {
    key_word=req.query["selectpicker"];
    console.log(key_word);
    request('https://search-map-7uq7g47ycnptvveydkyp4lsuca.us-east-1.es.amazonaws.com/twitter/', function (error, response, body) {
        console.log('error:', error); // Print the error if one occurred
        console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
        console.log('body:', body); // Print json
    });
});

io.sockets.on('connection', function (socket) {
  socket.on("start tweets", function() {
    stream.on('tweet', function(data) {
        if (data.coordinates){
            if (data.coordinates !== null){
                console.log(key_word);
                console.log(data.text);
                socket.emit('twitter-stream', data);
            }
        }
    });
    stream.on('error', function(error) {
        throw error;
    });
  });
  socket.emit("connected");
});

