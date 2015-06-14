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

  .controller('ReportCtrl', function($scope, $state, $ionicScrollDelegate, $cordovaCamera, ngNotify,
                                     ApiUrl, Geolocation, Violation, HtmlElement) {

    $scope.$on('$ionicView.enter', function() {
      console.log("Entered view, latitude=" + $scope.params.latitude);
      $ionicScrollDelegate.scrollTop(false);
      if (!$scope.params.latitude) {
        console.log("Initializing geolocation");
        $scope.initializeGeolocation();
      }
    });

    $scope.initializeGeolocation = function() {
      console.log("Inside initializeGeolocation");
      ngNotify.set('Finding your location...', {type: 'notify', duration: 5000});
      Geolocation.get().then(function(locationData) {
        ngNotify.dismiss();
        $scope.params.latitude = locationData.latitude;
        $scope.params.longitude = locationData.longitude;
        $scope.params.address = locationData.address;
        $scope.params.city = locationData.city;
      }, function(err) {
        ngNotify.dismiss();
        ngNotify.set('Unable to find current location. Is Location enabled?', {type: 'error'});
      });
    };

    $scope.initializeParams = function() {
      $scope.imageViewData = ' ';
      $scope.imageUploadData = null;
      $scope.params = {
        datetime_of_incident: new Date(),
        violationId: null,
        latitude: null
      };
    };

    $scope.resetForm = function() {
      $scope.initializeParams();
      $scope.initializeGeolocation();
    };

    $scope.takePicture = function() {
      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URL,
        sourceType: Camera.PictureSourceType.CAMERA
      };
      $cordovaCamera.getPicture(options).then(
        function(imageData) {
          console.log("Took photo");
          $scope.imageViewData = imageData;
          $scope.imageUploadData = imageData;
        },
        function(error) {
          console.log("Failed to take photo: " + JSON.stringify(error));
        });
    };

    $scope.selectPicture = function() {
      var options = {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY
      };

      $cordovaCamera.getPicture(options).then(
        function(imageURI) {
          console.log("Got photo from library");
          $scope.imageViewData = ' ';
          $scope.imageUploadData = imageURI;
          var image = document.getElementById('reportImage');
          image.src = imageURI;
        },
        function(error) {
          console.log("Failed to get photo from library: " + JSON.stringify(error));
        });
    };

    $scope.afterSubmit = function() {
      $state.go('tab.violations');
      ngNotify.dismiss();
      ngNotify.set('Your report has been uploaded.', {type: 'success'});
      $scope.initializeParams();
    };

    $scope.uploadPicture = function() {
      console.log("Attempting to upload file");
      if (!$scope.imageUploadData) {
        console.log("No image has been selected");
        $scope.afterSubmit();
        return;
      }

      function uploadSuccess(response) {
        console.log("Done uploading file");
        $scope.afterSubmit();
      }

      function uploadError(error) {
        ngNotify.set('Unable to upload your report photo at this time.', {type: 'error'});
        for (var key in error) {
          console.log("upload error[" + key + "]=" + error[key]);
        }
      }

      var options = new FileUploadOptions();
      options.fileKey = "image";
      options.fileName = "report.jpg";
      options.mimeType = "image/jpeg";
      options.chunkedMode = false; // Absolutely required for https uploads!
      options.params = {};
      options.params.violation_id = $scope.params.violationId;

      var ft = new FileTransfer();
      ft.upload($scope.imageUploadData, encodeURI(ApiUrl.get() + '/photos.json'),
        uploadSuccess, uploadError, options);
    };

    $scope.submitViolation = function() {
      if (!$scope.params.title) {
        console.log('You must enter a title.');
        ngNotify.set('You must enter a title', {type: 'error'});
        $ionicScrollDelegate.scrollTop(false);
        return;
      }
      console.log('Submitting violation...');
      ngNotify.set('Uploading violation report...', {type: 'notify', duration: 5000});
      var violation = new Violation($scope.params);
      violation.$save().then(function(response) {
        $scope.params.violationId = response.id;
        console.log('Done, created violation ' + $scope.params.violationId);
        $scope.uploadPicture();
      }, function(error) {
        ngNotify.dismiss();
        ngNotify.set('Unable to upload your report at this time.', {type: 'error'});
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
      var posOptions = {timeout: 5000, enableHighAccuracy: false};
      $cordovaGeolocation
        .getCurrentPosition(posOptions)
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
