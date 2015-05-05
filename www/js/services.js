angular.module('mybikelane.services', ['ngResource'])

  .factory('Camera', ['$q', function($q) {

    return {
      getPicture: function(options) {
        var q = $q.defer();

        if (!navigator.camera) {
          console.log('Camera is not available');
          return q.promise;
        }

        navigator.camera.getPicture(function(result) {
          // Do any magic you need
          q.resolve(result);
        }, function(err) {
          q.reject(err);
        }, options);

        return q.promise;
      }
    }
  }])

  .factory('Violation', function($resource) {
    return $resource(
      "http://staging.mybikelane.to/violations/:id.json/",
      {id: "@id"}
    );
  })

  .factory('Photo', function($resource) {
    return $resource(
      "http://staging.mybikelane.to/photos/:id.json/",
      {id: "@id"}
    );
  });

