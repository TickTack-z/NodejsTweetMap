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

app.get("/getJson",function () { return;});

//var track=['love','drink',"food","day","sleep","eat","think","hate","care","study"];
//var stream=twit.stream('statuses/filter', {track:track,language:'en',location:'-180,-90,180,90'});
var key_word="love";
io.sockets.on('connection', function (socket) {
    socket.on('clicked', function (value) {
        key_word=value;
        console.log("keyword:"+key_word);
        //get the key_word value

        //request ES result
        var datas=[];
        var url='https://search-map-7uq7g47ycnptvveydkyp4lsuca.us-east-1.es.amazonaws.com/tweet/_search?size=10000&q=text:'+key_word+'&pretty';
        request( url,function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            var body2=JSON.parse(body)["hits"];
            body2=body2.hits;
            console.log("data num:"+body2.length);
            for (var i = 0; i < body2.length; i++) {
                var temp=[body2[i]._source["text"],body2[i]._source["location"][0],body2[i]._source["location"][1]];
                datas.push(temp);
            }
            socket.emit("twitter-stream", datas);
        });
    });
    socket.on('distance', function(latLng){
        console.log(latLng);
        var lat=latLng[0];
        var lng=latLng[1];

        //request ES result
        var datas=[];
        var query= {
            "query": {
                "bool" : {
                    "must" : {
                        "match_all" : {}
                    },
                    "filter" : {
                        "geo_distance" : {
                            "distance" : "200km",
                            "location" : {
                                "lat" : 40,
                                "lon" : -70
                            }
                        }
                    }
                }
            }
        };
        var query = require('querystring').stringify(query);
        var url='https://search-map-7uq7g47ycnptvveydkyp4lsuca.us-east-1.es.amazonaws.com/tweet/_search?pretty';
        request( url+query ,function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            var body2=JSON.parse(body)["hits"];
            body2=body2.hits;
            console.log("data num:"+body2.length);
            for (var i = 0; i < body2.length; i++) {
                var temp=[body2[i]._source["text"],body2[i]._source["location"][0],body2[i]._source["location"][1]];
                datas.push(temp);
            }
            socket.emit("twitter-stream", datas);
        });
    });

});
/*
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

*/