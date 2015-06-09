#!/usr/bin/env bash

# Do once
#cordova plugin rm org.apache.cordova.console
#keytool -genkey -v -keystore $KEYSTORE_HOME/mybikelane-release-key.keystore -alias mybikelane -keyalg RSA -keysize 2048 -validity 10000


cordova build --release android

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/Dropbox/mybikelane-release-key.keystore platforms/android/build/outputs/apk/android-release-unsigned.apk mybikelane

rm MyBikeLane.apk; zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk MyBikeLane.apk
