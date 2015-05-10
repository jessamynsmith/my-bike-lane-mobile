my-bike-lane-mobile
===================

Ionic mobile app to track bike lane violations.


Development
-----------

    ionic platform add ios android
    ionic browser add crosswalk

    cordova plugin add org.apache.cordova.camera
    cordova plugin add org.apache.cordova.device
    cordova plugin add org.apache.cordova.file
    cordova plugin add org.apache.cordova.file-transfer
    cordova plugin add cordova-plugin-geolocation
    cordova plugin add cordova-plugin-whitelist

    ionic serve
    ionic run android

    ./create_apks.sh

Heroku
------

heroku addons:create newrelic:wayne
heroku addons:create papertrail:chokla

heroku config:set NODE_ENV=production
