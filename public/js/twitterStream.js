function initialize() {
    //Setup Google Map
    var myLatlng = new google.maps.LatLng(37.090, -95.712);
    var light_grey_style = [{
        "featureType": "landscape",
        "stylers": [{"saturation": -100}, {"lightness": 65}, {"visibility": "on"}]
    }, {
        "featureType": "poi",
        "stylers": [{"saturation": -100}, {"lightness": 51}, {"visibility": "simplified"}]
    }, {
        "featureType": "road.highway",
        "stylers": [{"saturation": -100}, {"visibility": "simplified"}]
    }, {
        "featureType": "road.arterial",
        "stylers": [{"saturation": -100}, {"lightness": 30}, {"visibility": "on"}]
    }, {
        "featureType": "road.local",
        "stylers": [{"saturation": -100}, {"lightness": 40}, {"visibility": "on"}]
    }, {
        "featureType": "transit",
        "stylers": [{"saturation": -100}, {"visibility": "simplified"}]
    }, {"featureType": "administrative.province", "stylers": [{"visibility": "off"}]}, {
        "featureType": "water",
        "elementType": "labels",
        "stylers": [{"visibility": "on"}, {"lightness": -25}, {"saturation": -100}]
    }, {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [{"hue": "#ffff00"}, {"lightness": -25}, {"saturation": -97}]
    }];
    var myOptions = {
        zoom: 4,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: google.maps.ControlPosition.LEFT_BOTTOM
        },
        styles: light_grey_style
    };
    var map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

    var marker, circle;

    function addCircle(location) {
        if (marker) {
            marker.setMap(null);
        }
        if (circle) {
            circle.setMap(null);
        }
        marker = new google.maps.Marker({
            position: location,
            map: map
        });
        circle = new google.maps.Circle({
            map: map,
            radius: 160930 * 5,    // 1000 miles in metres
            fillColor: '#AA0000'
        });
        circle.bindTo('center', marker, 'position');
        if (marker) {
            marker.setMap(null);
        }
    }

    markers_inst_list = [];
    var markers = [['London Eye, London', 51.503454, -0.119562], ['Palace of Westminster, London', 51.499633, -0.124755]];
    var infoWindow = new google.maps.InfoWindow(),
        i;

    for (i = 0; i < markers.length; i++) {
        var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
        markers_inst_list.push(new google.maps.Marker({
            position: position,
            map: map,
            title: markers[i][0]
        }));

        // Allow each marker to have an info window
        google.maps.event.addListener(markers_inst_list[i], 'click', (function (marker, i) {
            return function () {
                infoWindow.setContent(markers[i][0]);
                infoWindow.open(map, marker);
            }
        })(markers_inst_list[i], i));
    }

    document.getElementById("button").addEventListener("click", function () {
        for (var i = 0; i < markers_inst_list.length; i++) {
            markers_inst_list[i].setMap(null);
        }
        markers_inst_list.length = 0;
    });

    if (io !== undefined) {
        var socket = io.connect('/');
        document.getElementById("button").addEventListener("click", function () {
            if (circle) {
                circle.setMap(null);
            }
            if (pointLatLng){
                pointLatLng=(function () { return; })();
            }
            var e=document.getElementById("selectpicker");
            socket.emit('clicked',e.value);
        });
        var pointLatLng;
        map.addListener('click', function (event) {
            pointLatLng=event.latLng;
            addCircle(event.latLng);
            //clear old markers and show new markers
            for (var i = 0; i < markers_inst_list.length; i++) {
                markers_inst_list[i].setMap(null);
            }
            markers_inst_list.length = 0;

            //need some code here
            socket.emit("distance", event.latLng);

        });
        socket.on('twitter-stream', function (datas) {
            var data;
            for (var j=0; j < datas.length; j++)
            {
                data=datas[j];
                var tweetLocation = {lat: data[2], lng: data[1]};

                markers_inst_list.push(new google.maps.Marker({
                    position: tweetLocation,
                    map: map,
                    title: data[0]
                }));

                google.maps.event.addListener(markers_inst_list[j], 'click', (function (marker, j) {
                    return function () {
                        infoWindow.setContent(datas[j][0]);
                        infoWindow.open(map, marker);
                    }
                })(markers_inst_list[j], j));
            }


            setTimeout(function () {
                marker.setMap(null);
            }, 600);
        });
        setInterval(function () {
            if (circle){
                //code here
            }
            else {
                //code here
            }

        },3000);

    }
}

