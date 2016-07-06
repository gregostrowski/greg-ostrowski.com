/*  Author: Greg Ostrowski
    Split these modules into their own files.
*/

var gMap = gMap || {};
gMap.Search = (function () {
    var pub = {},
        _searchInput;
    
    
    pub.initSearch = function (searchInput, button) {
        _searchInput = searchInput;

        $(button).on('click', function () {
            if ($(_searchInput).val().length > 0) {
                //This is where you'd define where you send the geo search results to
                gMap.Geo.getGeoLocationFromString($(_searchInput).val(), displayPointOnMap);
                $(_searchInput).val("");
            }
        });

        $(_searchInput).keyup(function(event){
            if(event.keyCode == 13 && $(_searchInput).val().length > 0){
                gMap.Geo.getGeoLocationFromString($(_searchInput).val(), displayPointOnMap);
                $(_searchInput).val("");
            }
        });
    }

    function toQueryString(searchString) {
        var words = searchString.split(" ");
        var googleQueryString = "q=";
        words.forEach(function(word) {
            googleQueryString += word + "+";
        });
        return googleQueryString.slice(0, -1);
      };

    function displayPointOnMap(geoResults) {
        var lat = geoResults[0].geometry.location.lat(),
            lng = geoResults[0].geometry.location.lng(),
            addr = geoResults[0].formatted_address;

        gMap.Map.setMapLocation(lat, lng, addr);
        displayGeoCode(lat, lng, addr, ".geoResults");
    }

    return pub;
}());

gMap.Map = (function () {
    var pub = {},
        _map,
        _canvas,
        _fitButton,
        _points = []; //for use with setBounds function. each obj inside should be a google.maps.LatLng object
    
    //initialize google map 
    //param - canvas: element name where map will go (we cant use jQuery for this, don't include the '#' or '.' at the start of the element name)
    pub.initMap = function (canvas, fitButton) {
        _canvas = canvas;
        _fitButton = fitButton;

        var mapOptions = {
            zoom: 15,
            center: new google.maps.LatLng(37.7632059, -122.24256200000002), //this is alameda
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            disableDefaultUI: true,
            zoomControl: true
        };
        _map = new google.maps.Map(document.getElementById(_canvas), mapOptions);

        if(fitButton) { 
            $(fitButton).click(function () {
                if($(this).prop("checked")) {
                    pub.setBounds();
                }
            });
        }
    };

    pub.getMapObj = function () {
        return _map;
    }

    //Set the Map's center to the the lat/lng passed as parameters
    pub.setMapLocation = function (lat, lng, title) {
        _map.setCenter(new google.maps.LatLng(lat, lng));
        pub.addMarker(lat, lng, title);
    };
    //Add a marker at the position with title
    pub.addMarker = function (lat, lng, title, markerIcon, infoWindowHtml) {
        var marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: _map,
                title: title,
                icon: markerIcon
            });
        if(infoWindowHtml) {
            var infowindow = new google.maps.InfoWindow({
                content: infoWindowHtml
            });
            google.maps.event.addListener(marker, 'click', function() {
                infowindow.open(_map,marker);
            });
        }

        _points.push(new google.maps.LatLng(lat, lng));

        if($(_fitButton).prop("checked")) {
            pub.setBounds();
        }
    };

    //configures the view of the map to make sure all _points are visible
    //all points within _points should be google.maps.LatLng objects
    pub.setBounds = function () {
        var bounds = new google.maps.LatLngBounds();
        $.each(_points, function (index, item) {
            bounds.extend(item);
        });

        //  Fit these bounds to the map
        _map.fitBounds(bounds);
    };

    return pub;
}());

gMap.Geo = (function () {
    var pub = {},
        _geocoder = new google.maps.Geocoder();
			
    pub.getGeoLocationFromString = function (searchInput, callback) {
		  
        _geocoder.geocode( { 'address': searchInput }, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                callback(results);
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });
    };
			
    return pub;
}());

gMap.Location = (function () { 
    var pub = {},
        _selfIcon = '../src/img/loc.png',
        loc_options = {
            enableHighAccuracy: true, 
            maximumAge        : 0, 
            timeout           : 5000,
            desiredAccuracy   : 0,
            frequency         : 1
        },
        _selfMarker,
        _watchId = null;

    pub.getLocation = function () {
    	navigator.geolocation.getCurrentPosition(getLocationSuccess, getLocationFailure);
    };

    pub.watchLocation = function () {
        _watchId = navigator.geolocation.watchPosition(getLocationSuccess, getLocationFailure, loc_options);
    };

    function getLocationSuccess (position) { 
        console.log('update position');
        if(!_selfMarker) { 
            _selfMarker = new google.maps.Marker({
                position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                map: gMap.Map.getMapObj(),
                icon: _selfIcon
            });
        } else { 
            var newPos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            _selfMarker.setPosition(newPos);
        }
    }

    function getLocationFailure (position) { 
        console.log('Error getting location');
    }

    return pub;
}());

function displayGeoCode(lat, lng, addr, list) {
    var item = $("<li></li>");
    item.append(addr + ": " + lat + ", " + lng);
    $(list).append(item);
}

