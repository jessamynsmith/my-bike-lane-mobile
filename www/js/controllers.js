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

  .controller('ReportCtrl', function($scope, $state, $cordovaGeolocation, notify,
                                     Camera, Violation) {

    $scope.initializeGeolocation = function() {
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
    };

    $scope.initializeParams = function() {
      $scope.params = {
        datetime_of_incident: new Date(),
        imageUri: ' ',
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

    // TODO allow user to attach photo from docs
    // TODO only show get photo button if camera enabled
    $scope.getPhoto = function() {
      Camera.getPicture().then(function(imageUri) {
        $scope.params.imageUri = imageUri;
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
      if ($scope.params.imageUri === ' ') {
        console.log("No image has been selected");
        $scope.afterSubmit();
        return;
      }
      var options = new FileUploadOptions();
      options.fileKey = "image";
      options.fileName = $scope.params.imageUri.substr($scope.params.imageUri.lastIndexOf('/') + 1);
      options.mimeType = "image/jpeg";
      options.params = {};
      options.params.violation_id = $scope.params.violationId;

      var ft = new FileTransfer();
      ft.upload($scope.params.imageUri, encodeURI('http://staging.mybikelane.to/photos.json'),
        uploadSuccess, uploadError, options);
      function uploadSuccess(response) {
        console.log("Done uploading file");
        $scope.afterSubmit();
      }
      function uploadError(error) {
        notify('Unable to upload your report photo at this time. :(');
        for (var key in error) {
          console.log("upload error[" + key +"]=" + error[key]);
        }
      }
    };

    $scope.submitViolation = function() {
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
    $scope.doRefresh = function() {
      $scope.violations = Violation.query();
      //Stop the ion-refresher from spinning
      $scope.$broadcast('scroll.refreshComplete');
    };
  })

  .controller('ViolationDetailCtrl', function($scope, $stateParams, Violation) {
    $scope.violation = Violation.get({}, {'id': $stateParams.violationId});
  });
