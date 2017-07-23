
var map;

var markers = [];


/* generic model for address */

var AddressModel = function() {

	this.marker = ko.observable();

	this.location = ko.observable();

	this.streetNumber = ko.observable();

	this.streetName = ko.observable();

	this.city = ko.observable();

	this.state = ko.observable();

	this.postCode = ko.observable();

	this.country = ko.observable();

};


/* method to update address */

var populateAddress = function(place) {

  console.log(place);

  // value().streetNumber(place);
}


/* method to place a marker on the map */

var placeMarker = function (location, value) {

	// create and place marker on the map

	var marker = new google.maps.Marker({

		position: location,

		map: map

	});

	//store the newly created marker in the address model

	value().marker(marker);

};


/* method to remove old marker from the map */

var removeMarker = function(address) {

	if(address != null) {

		address.marker().setMap(null);

	}

};


/* method to register subscriber */

var registerSubscribers = function () {

	//fire before from address is changed

	mapsModel.forEach(function(mapModel){

		mapModel.address.subscribe(function(oldValue){

			removeMarker(oldValue);

		}, null, "addressChange");
	});

};


/* method to update the address model */

var updateAddress = function(place, value) {

	populateAddress(place);

	placeMarker(place.geometry.location, value);

};


/* Initialize the map */

function initialize() {

	var mapOptions = {
		center: {lat: -33.8688, lng: 151.2195},
		zoom: 13,
		scrollwheel: false
  };

  var map = new google.maps.Map(document.getElementById('map'), mapOptions);

  var input = (document.getElementById('txtplaces'));

  // Create the autocomplete helper, and associate it with
  // an HTML text input box.
  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);

  var infowindow = new google.maps.InfoWindow();

  var marker = new google.maps.Marker({
    map: map
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map, marker);
  });

  // Get the full place details when the user selects a place from the
  // list of suggestions.
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    infowindow.close();
    var place = autocomplete.getPlace();
    if (!place.geometry) {
      return;
    }

    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }

    updateAddress(place, marker);

    // Set the position of the marker using the place ID and location.
    marker.setPlace(/** @type {!google.maps.Place} */ ({
      placeId: place.place_id,
      location: place.geometry.location
    }));
    marker.setVisible(true);

    infowindow.setContent('<div><strong>' + place.name + '</strong><br>' +
        'Place ID: ' + place.place_id + '<br>' +
        place.formatted_address + '</div>');
    infowindow.open(map, marker);
  });
}

// Run the initialize function when the window has finished loading.
google.maps.event.addDomListener(window, 'load', initialize);
