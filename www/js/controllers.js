angular.module('mybikelane.controllers', [])

  .controller('AppCtrl', function($scope, $ionicModal, $timeout) {
    // TODO enable login
    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.modal.show();
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function() {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function() {
        $scope.closeLogin();
      }, 1000);
    };
  })

  .controller('ReportCtrl', function($scope, $state, $ionicScrollDelegate, $cordovaGeolocation,
                                     notify, Camera, Violation) {

    $scope.initializeGeolocation = function() {
      // TODO Style notifications, change timeouts
      notify('Finding your location...');
      var posOptions = {timeout: 10000, enableHighAccuracy: false};
      $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
        $scope.params.latitude = position.coords.latitude;
        $scope.params.longitude = position.coords.longitude;
        var geocoder = L.Control.Geocoder.nominatim({serviceUrl: 'https://nominatim.openstreetmap.org/'});
        geocoder.reverse({lat: position.coords.latitude, lng: position.coords.longitude}, 10,
          function(results) {
            if (results[0].properties.address) {
              $scope.params.address = results[0].properties.address.house_number + ' ' +
              results[0].properties.address.road;
              $scope.params.city = results[0].properties.address.city;
            } else {
              console.log('Location not found');
            }
          });
      });
    };

    $scope.initializeParams = function() {
      $scope.imageUri = ' ';
      $scope.params = {
        datetime_of_incident: new Date(),
        violationId: null
      };
      $scope.initializeGeolocation();
    };

    $scope.getImageSrc = function(src) {
      if (src !== "") {
        return src;
      } else {
        return "//:0";
      }
    };

    // TODO allow user to attach photo from docs, if possible
    $scope.getPhoto = function() {
      Camera.getPicture({}, notify).then(function(imageUri) {
        $scope.imageUri = imageUri;
      }, function(err) {
        console.log(err);
      });
    };

    $scope.afterSubmit = function() {
      $state.go('tab.violations');
      if ($scope.uploading) {
        $scope.uploading.close();
      }
      notify('Your report has been uploaded.');
      $scope.initializeParams();
    };

    $scope.upload = function() {
      console.log("Attempting to upload file");
      if ($scope.imageUri === ' ') {
        console.log("No image has been selected");
        $scope.afterSubmit();
        return;
      }
      var options = new FileUploadOptions();
      options.fileKey = "image";
      options.fileName = $scope.imageUri.substr($scope.imageUri.lastIndexOf('/') + 1);
      options.mimeType = "image/jpeg";
      options.chunkedMode = false; // Absolutely required for https uploads!
      options.params = {};
      options.params.violation_id = $scope.params.violationId;

      var ft = new FileTransfer();
      ft.upload($scope.imageUri, encodeURI('https://mybikelane-staging.herokuapp.com/photos.json'),
        uploadSuccess, uploadError, options);
      function uploadSuccess(response) {
        console.log("Done uploading file");
        $scope.afterSubmit();
      }

      function uploadError(error) {
        notify('Unable to upload your report photo at this time. :(');
        for (var key in error) {
          console.log("upload error[" + key + "]=" + error[key]);
        }
      }
    };

    $scope.submitViolation = function() {
      if (!$scope.params.title) {
        console.log('You must enter a title.');
        notify('You must enter a title');
        $ionicScrollDelegate.scrollTop(false);
        return;
      }
      console.log('Submitting violation...');
      $scope.uploading = notify('Uploading violation report...');
      var violation = new Violation($scope.params);
      violation.$save().then(function(response) {
        $scope.params.violationId = response.id;
        console.log('Done, created violation ' + $scope.violationId);
        $scope.upload();
      }, function(error) {
        notify('Unable to upload your report at this time. :(');
        console.log(error);
      });
    };

    $scope.initializeParams();
  })

  .controller('MapCtrl', function($scope, $state, $cordovaGeolocation, Violation) {

    $scope.latitude = null;
    $scope.longitude = null;

    $scope.addCurrentPositionMarker = function() {
      $scope.map.markers.currentPosition = {
        lat: $scope.latitude,
        lng: $scope.longitude,
        message: 'You are here!',
        draggable: false
      };
    };

    $scope.locate = function() {
      $cordovaGeolocation
        .getCurrentPosition()
        .then(function(position) {
          $scope.latitude = position.coords.latitude;
          $scope.longitude = position.coords.longitude;
          $scope.map.center = {
            lat: $scope.latitude,
            lng: $scope.longitude,
            zoom: 15
          };
          $scope.addCurrentPositionMarker();
        }, function(err) {
          console.log('Error retrieving location: ' + err);
        });
    };

    var local_icons = {
        default_icon: {},
        red_icon: {
          iconUrl: 'img/red-icon.png',
          shadowUrl: 'lib/leaflet/dist/images/marker-shadow.png',
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        }
    };

    angular.extend($scope, {
        icons: local_icons
    });

    $scope.map = {
      defaults: {
        tileLayer: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        maxZoom: 18,
        zoomControlPosition: 'bottomleft'
      },
      center: {
        // Default to downtown Toronto
        lat: 43.6722780,
        lng: -79.3745125,
        zoom: 14
      },
      markers: {},
      events: {
        map: {
          enable: ['context'],
          logic: 'emit'
        }
      }
    };

    $scope.goToViolation = function(violationId) {
      $state.go('tab.violations-detail', {violationId: violationId});
    };

    $scope.loadMarkers = function() {
      var violations = Violation.query(function() {
        var getScope = function() {
          return $scope;
        };
        for (var i = 0; i < violations.length; i++) {
          $scope.map.markers[violations[i].id] = {
            lat: violations[i].latitude,
            lng: violations[i].longitude,
            icon: local_icons.red_icon,
            message: '<span ng-click="goToViolation(\'' + violations[i].id + '\')">' +
            violations[i].title + '</span>',
            getMessageScope: getScope,
            draggable: false
          };
        }
      });
    };

    $scope.reloadMarkers = function() {
      $scope.map.markers = {};
      $scope.addCurrentPositionMarker();
      $scope.loadMarkers();
    };

    $scope.locate();
    $scope.loadMarkers();
  })

  .controller('ViolationsCtrl', function($scope, $stateParams, Violation) {
    $scope.violations = Violation.query();
    $scope.doRefresh = function() {
      $scope.violations = Violation.query();
      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    };
  })

  .controller('ViolationDetailCtrl', function($scope, $ionicHistory, $state, $stateParams, Violation) {
    $scope.goToViolations = function() {
      $ionicHistory.nextViewOptions({
        historyRoot: true,
        disableBack: true
      });
      $state.go('tab.violations');
    };
    $scope.violation = Violation.get({}, {'id': $stateParams.violationId});
  });
