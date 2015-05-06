// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'mybikelane' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'mybikelane.controllers' is found in controllers.js
angular.module('mybikelane', ['ionic', 'ui.router', 'ngCordova', 'uiGmapgoogle-maps',
  'mybikelane.controllers', 'mybikelane.services'])

  .run(function($ionicPlatform) {
    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleDefault();
      }
    });
  })

  .config(function(uiGmapGoogleMapApiProvider) {
    uiGmapGoogleMapApiProvider.configure({
      //    key: 'your api key',
      v: '3.17',
      libraries: 'weather,geometry,visualization'
    });
  })

  .config(function($stateProvider, $urlRouterProvider) {
    $stateProvider

      .state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "templates/menu.html",
        controller: 'AppCtrl'
      })

      .state('app.submit', {
        url: "/submit",
        views: {
          'menuContent': {
            templateUrl: "templates/submit.html",
            controller: 'SubmitCtrl'
          }
        }
      })

      .state('app.map', {
        url: "/map",
        views: {
          'menuContent': {
            templateUrl: "templates/map.html",
            controller: 'MapCtrl'
          }
        }
      })

      .state('app.violations', {
        url: "/violations",
        views: {
          'menuContent': {
            templateUrl: "templates/violations.html",
            controller: 'ViolationsCtrl'
          }
        }
      })

      .state('app.violation', {
        url: "/violations/:violationId",
        views: {
          'menuContent': {
            templateUrl: "templates/violation.html",
            controller: 'ViolationCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/submit');
  });
