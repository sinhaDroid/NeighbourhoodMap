/* Module for maps application */
var MapsApplication = function () {
  /* add members here */
  var localLocation = {lat: 13.0622714, lng: 77.59625439999999};
  var listofplaces = [];

  /* model to hold addresses */
  var mapsModel = {
    address: ko.observable(),
    places: ko.observableArray(listofplaces),

    goToMarker: function(place) {
      var name = place.sName();
      for(var key in mapsModel.places()) {
        if (mapsModel.places()[key].sName() === name) {
          google.maps.event.trigger(
            mapsModel.places()[key].marker(), 'click', function() {
              infowindow.setContent(name);
              infowindow.open(map, this);
            }
          );
        }
      }
    }
  };

  /* generic model for address */
  var AddressModel = function() {
    this.marker = ko.observable();
    this.location = ko.observable();
    this.sName = ko.observable();
    this.sAddress = ko.observable();
  };

  /* method to center map based on the location*/
  var centerMap = function (location) {
    map.setCenter(location);
    map.setZoom(17);
    google.maps.event.trigger(map, 'resize');
  }

  /* method to place a marker on the map */
  var placeMarker = function (place, value) {
    // create and place marker on the map
    var pos = new google.maps.LatLng(
      place.geometry.location.lat(),
      place.geometry.location.lng()
    );
    marker = new google.maps.Marker({
      position: pos,
      map: map,
      animation: google.maps.Animation.BOUNCE
    });
    //store the newly created marker in the address model
    value().marker(marker);

    setInfoContent(place.name);
  };

  function setInfoContent(name) {
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.setContent(name);
      infowindow.open(map, this);
    });
  }

  /* method to retrieve address information in the model */
  var populateAddress = function (place, value) {
    
    var address = new AddressModel();
    //set location
    address.location(place.geometry.location);
    address.sName(place.name);
    address.sAddress(place.vicinity);

    //set the address model in the binding value
    value(address);

    listofplaces.push(address);
  };

  /* method to update the address model */
  var updateAddress = function(place, value) {
    populateAddress(place, value);
    placeMarker(place, value);
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
            updateAddress(place, value);
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
    };
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


  var init = function () {
    configureBindingHandlers()
    /* add code to initialize this module */
    ko.applyBindings(MapsApplication);
  };

  /* execute the init function when the DOM is ready */
  $(init);
  
  return {
    /* add members that will be exposed publicly */
    mapsModel
  };
}();
