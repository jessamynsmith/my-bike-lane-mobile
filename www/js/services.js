angular.module('mybikelane.services', ['ngResource'])

  .factory('ApiUrl', function() {
    return {
      get: function() {
        // TODO make this an app setting?
        // Production
        return 'http://www.mybikelane.to';
        // Staging
        //return 'https://mybikelane-staging.herokuapp.com';
      }
    };
  })

  .factory('Geolocation', ['$q', '$cordovaGeolocation', function($q, $cordovaGeolocation) {
    return {
      get: function() {
        console.log("Inside Geolocation.get()");
        var q = $q.defer();
        var data = {
          latitude: '',
          longitude: '',
          address: '',
          city: ''
        };
        var posOptions = {timeout: 10000, enableHighAccuracy: false};
        $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
          console.log("Got location: " + JSON.stringify(position));
          data.latitude = position.coords.latitude;
          data.longitude = position.coords.longitude;
          var geocoder = L.Control.Geocoder.nominatim({serviceUrl: 'https://nominatim.openstreetmap.org/'});
          geocoder.reverse({lat: data.latitude, lng: data.longitude}, 10,
            function(results) {
              console.log("Did reverse lookup, got: " + JSON.stringify(results));
              if (results.length > 0) {
                var result = results[0].properties;
                data.address = result.address.house_number + ' ' + result.address.road;
                data.city = result.address.city;
              } else {
                console.log('Location not found');
              }
              q.resolve(data);
            });
        }, function(err) {
          console.log('Unable to get current position: ' + JSON.stringify(err));
          q.reject('Unable to get current position');
        });
        return q.promise;
      }
    };
  }])

  .factory('Camera', ['$q', function($q) {
    return {
      getPicture: function(options, ngNotify) {
        var q = $q.defer();
        if (!navigator.camera) {
          console.log('Camera is not available');
          ngNotify.set('Camera is not available', 'error');
        } else {
          navigator.camera.getPicture(function(result) {
            q.resolve(result);
          }, function(err) {
            q.reject(err);
          }, options);
        }
        return q.promise;
      }
    };
  }])

  .factory('Violation', function(ApiUrl, $resource) {
    return $resource(
      ApiUrl.get() + "/violations/:id.json/",
      {id: "@id"}
    );
  })

  .factory('HtmlElement', function() {
    return {
      getById: function(elementType, elementId) {
        var element = null;
        var elements = angular.element(document).find(elementType);
        for (var i = 0; i < elements.length; i++) {
          if (elements[i].id == elementId) {
            element = elements[i];
            break;
          }
        }
        return element;
      }
    };
  })
;

