#!/bin/bash
export PROJ_HOME=$PWD

echo 'Deleting platforms ...'
phonegap platform remove ios
phonegap platform remove android

echo 'Uninstalling Couchbase plug-in ...'
phonegap local plugin remove com.couchbase.lite.phonegap

echo 'Adding platforms ...'
phonegap platform add ios
phonegap platform add android

echo 'Reinstalling Couchbase plug-in ...'
phonegap local plugin add https://github.com/couchbaselabs/Couchbase-Lite-PhoneGap-Plugin.git

echo 'Rebuilding ...'
phonegap local build ios
phonegap local build android
