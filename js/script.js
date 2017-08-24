var localLocation = {lat: 13.0622714, lng: 77.59625439999999};
var listofplaces = [];
var map, infowindow, bounds;
var addressModel;


/* generic model to hold list of places */
class MapsModel {
  constructor(props) {
    var self = this;
  
    self.address = ko.observable();
    self.places = ko.observableArray(listofplaces);
    
    // self.marker = ko.observable();
    // self.location = ko.observable();
    // self.sName = ko.observable();
    // self.sAddress = ko.observable();
  }
};

var goToMarkers = function(place) {
  var name = place.sName;
  var locMarker;
  var placesArray = addressModel.places();
  for(var key in placesArray) {
    if (placesArray[key].sName === name) {
      locMarker = placesArray[key].marker;
    }
  }

  google.maps.event.trigger(locMarker, 'click', function() {
    infowindow.setContent(name);
    infowindow.open(map, this);
  });
}


function setInfoContent(name, marker) {
  google.maps.event.addListener(marker, 'click', function() {
    infowindow.setContent(name);
    infowindow.open(map, this);
  });
}


/* method to center map based on the location*/
var centerMap = function (location) {
  map.setCenter(location);
  map.setZoom(17);
  google.maps.event.trigger(map, 'resize');
};


/* method to place a marker on the map */
var placeMarker = function (place, value) {
  // create and place marker on the map
  var pos = new google.maps.LatLng(
    place.geometry.location.lat(),
    place.geometry.location.lng()
  );

  //store the newly created marker
  marker = new google.maps.Marker({
    position: pos,
    map: map,
    animation: google.maps.Animation.BOUNCE
  });

  setInfoContent(place.name, marker);

  return marker;
};


/* method to retrieve address information in the model */
var populateAddress = function (place, value) {
  
  //set the address model in the binding value
  value(addressModel);

  addressModel.places.push({
    location: place.geometry.location,
    sName: place.name,
    sAddress: place.vicinity,
    marker: placeMarker(place)
  });
};


/* method to retrieve nearBy places */
function nearBySearch(location, value) {
  var request = {
    location: location,
    radius: '500',
    types: ['store', 'café','food', 'bar']
  };
  centerMap(location);
  // Request for places library for nearby places of interest
  new google.maps.places.PlacesService(map).nearbySearch(
    request, function callback(results, status){
      if (status == google.maps.places.PlacesServiceStatus.OK) {

        for (var i = 0; i < results.length; i++) {
          var place = results[i];
          value(place);
          // method to update the address model
          populateAddress(place, value);
        }
      }
    }
  );
}


/* method to retrieve and set local location */
var setLocalLocation = function (value) {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(function(position) {
      localLocation.lat = position.coords.latitude;
      localLocation.lng = position.coords.longitude;
      nearBySearch(localLocation, value);
      console.log("successfully retrieved local location. Lat [" + localLocation.lat + "] Lng [" + localLocation.lng + "]");
    },
    function (error) {
      console.log("Could not get current coords: " + error.message);
    });
  }
};


/* method to add custom binding handlers to knockout */
var configureBindingHandlers = function() {
  /* custom binding for address auto complete */
  ko.bindingHandlers.addressAutoComplete = {
    init: function(element, valueAccessor){
      // create the autocomplete object
      var autocomplete = new google.maps.places.Autocomplete( element,{ types: ['geocode'] });
      // when the user selects an address from the dropdown, populate the address in the model.
      var value = valueAccessor();
      google.maps.event.addListener(autocomplete, 'place_changed', function() {
        var place = autocomplete.getPlace();
        nearBySearch(place.geometry.location, value);
      });
    }
  };

  /* custom binding handler for maps panel   */
  ko.bindingHandlers.mapPanel = {
    init: function(element, valueAccessor){
      map = new google.maps.Map(element, {
        zoom: 13
      });
      infowindow = new google.maps.InfoWindow();
      var value = valueAccessor();
      centerMap(localLocation);
      setLocalLocation(value);
    }
  };
};


/**
 * Error callback for GMap API request
 */
mapError = () => {
  // Error handling
};


/**
 * Success callback for Map API request
 */
initMap = () => {
  // Sidenav init
  var container = document.getElementById('slide-out');
  Ps.initialize(container, {
    wheelSpeed: 2,
    wheelPropagation: true,
    minScrollbarLength: 20
  });

  new WOW();

  configureBindingHandlers();
  /* add code to initialize this module */
  addressModel = new MapsModel();
  ko.applyBindings(addressModel);
};
