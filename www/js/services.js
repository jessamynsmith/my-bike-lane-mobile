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

  .factory('Photo', function($q, $cordovaCamera, ApiUrl) {
    return {
      takePicture: function(ngNotify) {
        var q = $q.defer();
        if (typeof Camera === 'undefined') {
          var error = 'Camera is not available';
          console.log(error);
          ngNotify.set(error, {type: 'error'});
          q.reject(error);
        } else {
          var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URL,
            sourceType: Camera.PictureSourceType.CAMERA
          };
          $cordovaCamera.getPicture(options).then(
            function(imageData) {
              q.resolve(imageData);
            },
            function(error) {
              console.log("Failed to take photo: " + JSON.stringify(error));
              q.reject(error);
            });
        }
        return q.promise;
      },
      selectPicture: function(ngNotify) {
        var q = $q.defer();
        if (typeof Camera === 'undefined') {
          var error = 'Camera is not available';
          console.log(error);
          ngNotify.set(error, {type: 'error'});
          q.reject(error);
        } else {
          var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
          };
          $cordovaCamera.getPicture(options).then(
            function(imageData) {
              q.resolve(imageData);
            },
            function(error) {
              console.log("Failed to get photo from library: " + JSON.stringify(error));
              q.reject(error);
            });
        }
        return q.promise;
      },
      uploadPicture: function(ngNotify, violationId, imageData) {
        var q = $q.defer();

        var options = new FileUploadOptions();
        options.fileKey = "image";
        options.fileName = "report.jpg";
        options.mimeType = "image/jpeg";
        options.chunkedMode = false; // Absolutely required for https uploads!
        options.params = {};
        options.params.violation_id = violationId;

        var ft = new FileTransfer();
        ft.upload(imageData, encodeURI(ApiUrl.get() + '/photos.json'),
          function(response) {
            console.log("Done uploading file");
            q.resolve(response);
          },
          function(error) {
            ngNotify.set('Unable to upload your photo at this time.', {type: 'error'});
            for (var key in error) {
              console.log("upload error[" + key + "]=" + error[key]);
            }
            q.reject(error);
          }, options);
        return q.promise;
      }
    };
  })

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

