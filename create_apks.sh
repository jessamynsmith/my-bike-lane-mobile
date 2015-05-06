#!/usr/bin/env bash

# Do once
#cordova plugin rm org.apache.cordova.console
#keytool -genkey -v -keystore $KEYSTORE_HOME/taotrack-release-key.keystore -alias taotrack -keyalg RSA -keysize 2048 -validity 10000


cordova build --release android

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/Dropbox/mybikelane-release-key.keystore platforms/android/build/outputs/apk/android-x86-release-unsigned.apk mybikelane
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/Dropbox/mybikelane-release-key.keystore platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk mybikelane

rm MyBikeLane_x86.apk; zipalign -v 4 platforms/android/build/outputs/apk/android-x86-release-unsigned.apk MyBikeLane_x86.apk
rm MyBikeLane_armv7.apk; zipalign -v 4 platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk MyBikeLane_armv7.apk
