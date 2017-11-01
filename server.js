var express = require('express'),
    bodyParser = require('body-parser'),
    app = express(),
    http = require('http'),
    server = http.createServer(app),
    io = require('socket.io').listen(server);
var request = require('request');

//Use the default port (for beanstalk) or default to 8081 locally
server.listen(process.env.PORT || 8081);

//Setup routing for app
app.use(express.static(__dirname + '/public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse application/json
app.use(bodyParser.json());

app.get("/getJson", function () {
    return;
});

var key_word = "love";
io.sockets.on('connection', function (socket) {
    socket.on('clicked', function (value) {
        var datas = [];
        key_word = value;
        //get the key_word value

        //request ES result
        var url = 'someURL/tweet/_search?size=3000&q=text:' + key_word + '&pretty';
        request(url, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            var body2 = JSON.parse(body)["hits"];
            body2 = body2.hits;
            for (var i = 0; i < body2.length; i++) {
                var temp = [body2[i]._source["text"], body2[i]._source["location"][0], body2[i]._source["location"][1]];
                datas.push(temp);
            }
            socket.emit("twitter-stream", datas);
        });
    });
    socket.on('distance', function (latLng) {
        var lat = latLng["lat"];
        var lng = latLng["lng"];

        //request ES result
        var datas = [];
        var elasticsearch = require('elasticsearch');
        var client = new elasticsearch.Client({
            host: 'someURL',
            log: 'trace'
        });

        client.ping({
            // ping usually has a 3000ms timeout
            requestTimeout: 1000
        }, function (error) {
            if (error) {
                console.trace('elasticsearch cluster is down!');
            } else {
                console.log('All is well');
            }
        });

        client.search({
            index: 'tweet',
            size: 5000,
            type: 'my_type',
            body:
                {
                    "query": {
                        "bool": {
                            "must": {
                                "match_all": {}
                            },
                            "filter": {
                                "geo_distance": {
                                    "distance": "200km",
                                    "location": {
                                        "lat": lat,
                                        "lon": lng
                                    }
                                }
                            }
                        }
                    }
                }

        }).then(function (resp) {
            var hits = resp.hits.hits;
            for (var i = 0; i < hits.length; i++) {
                var temp = [hits[i]._source["text"], hits[i]._source["location"][0], hits[i]._source["location"][1]];
                datas.push(temp);
            }
            socket.emit("twitter-stream", datas);

        }, function (err) {
            console.trace(err.message);
        });
    });
});
