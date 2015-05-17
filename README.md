my-bike-lane-mobile
===================

Ionic mobile app to track bike lane violations.


Development
-----------

    ionic platform add ios android
    ionic browser add crosswalk

    ionic plugin add org.apache.cordova.camera
    ionic plugin add org.apache.cordova.device
    ionic plugin add org.apache.cordova.file
    ionic plugin add org.apache.cordova.file-transfer
    ionic plugin add cordova-plugin-geolocation
    ionic plugin add https://github.com/apache/cordova-plugin-whitelist.git

    ionic serve
    ionic run android

    ./create_apks.sh

Heroku
------

heroku addons:create newrelic:wayne
heroku addons:create papertrail:chokla

heroku config:set NODE_ENV=production
