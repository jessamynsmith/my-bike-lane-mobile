angular.module('mybikelane.services', ['ngResource'])

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

  .factory('Violation', function($resource) {
    return $resource(
      "http://www.mybikelane.to/violations/:id.json/",
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

