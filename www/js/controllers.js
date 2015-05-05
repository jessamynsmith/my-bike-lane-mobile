angular.module('mybikelane.controllers', [])

  .controller('AppCtrl', function($scope, $ionicModal, $timeout) {
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

  .controller('SubmitCtrl', function($scope, $cordovaGeolocation, Camera, Violation) {
    $scope.getPhoto = function() {
      Camera.getPicture().then(function(imageUri) {
        $scope.params.imageUri = imageUri;
      }, function(err) {
        console.err(err);
      });
    };

    $scope.submitViolation = function() {
      console.log('Submitting...');
      var violation = new Violation($scope.params);
      var result = violation.$save().then(function(response) {
        var violationId = response.id;
        console.log('Done, created violation ' + violationId);
        if ($scope.params.imageUri) {
          console.log($scope.params.imageUri);
          // TODO Upload photo here
        }
      });
    };

    $scope.params = {
      datetime_of_incident: new Date()
    };

    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
      $scope.params.latitude = position.coords.latitude;
      $scope.params.longitude = position.coords.longitude;
      var geocoder = new google.maps.Geocoder();
      var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      geocoder.geocode({'latLng': latlng}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          if (results[0]) {
            $scope.params.address = results[0].address_components[0].long_name + ' '
            + results[0].address_components[1].long_name;
            $scope.params.city = results[0].address_components[4].long_name;
          } else {
            console.log('Location not found');
          }
        } else {
          console.log('Geocoder failed due to: ' + status);
        }
      });
    }, function(err) {
      console.log('Error retrieving location: ' + err)
    });
  })

  .controller('MapCtrl', function($scope, $cordovaGeolocation) {
    var posOptions = {timeout: 10000, enableHighAccuracy: false};
    $cordovaGeolocation.getCurrentPosition(posOptions).then(function(position) {
      $scope.map = {
        center: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }, zoom: 15
      };
    }, function(err) {
      console.log('Error retrieving location: ' + err)
    });
  })

  .controller('ViolationsCtrl', function($scope, $stateParams, Violation) {
    $scope.violations = Violation.query();
  })

  .controller('ViolationCtrl', function($scope, $stateParams, Violation) {
    $scope.violation = Violation.get({}, {'id': $stateParams.violationId});
  });
