// MyBikeLane App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'mybikelane' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'mybikelane.controllers' is found in controllers.js
angular.module('mybikelane', ['ionic', 'ui.router', 'ngCordova', 'ngNotify', 'leaflet-directive',
  'mybikelane.controllers', 'mybikelane.services'])

  .run(function($ionicPlatform, ngNotify) {

    ngNotify.config({
      theme: 'pure',
      position: 'top',
      duration: 2000
    });
    ngNotify.addType('notify', 'notify');

    $ionicPlatform.ready(function() {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      }
      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        StatusBar.styleLightContent();
      }
    });
  })

  .config(function($stateProvider, $urlRouterProvider) {

    $stateProvider

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: "/tab",
        abstract: true,
        templateUrl: "templates/tabs.html"
      })

      // Each tab has its own nav history stack:

      .state('tab.report', {
        url: '/report',
        views: {
          'tab-report': {
            templateUrl: 'templates/tab-report.html',
            controller: 'ReportCtrl'
          }
        }
      })

      .state('tab.map', {
        url: '/map',
        views: {
          'tab-map': {
            templateUrl: 'templates/tab-map.html',
            controller: 'MapCtrl'
          }
        }
      })

      .state('tab.violations', {
        url: '/violations',
        views: {
          'tab-violations': {
            templateUrl: 'templates/tab-violations.html',
            controller: 'ViolationsCtrl'
          }
        }
      })
      .state('tab.violations-detail', {
        url: '/violations/:violationId',
        views: {
          'tab-violations': {
            templateUrl: 'templates/violation-detail.html',
            controller: 'ViolationDetailCtrl'
          }
        }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/report');

  });
