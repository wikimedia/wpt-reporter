#!/bin/bash

# Use this script to test all batch scripts.
# To be able to run it you need to set a couple of env
# variables. Make sure to change the values :)
#
# export WMF_WPT_KEY=OURKEY
# export WPT_ORG_WPT_KEY=THE_KEY_FOR_WEBPAGETEST.ORG
# export WPT_USER=THE_USER_NAME_OF_OUR_USER
# export WPT_USER_PASSWORD=THE_PASSWORD_OF_OUR_USER
#
# Run me from the root folder of the project
# test/rulethemall.sh

export STATSV_ENDPOINT=http://localhost
export WPT_MOBILE_RUNS=1
export WPT_RUNS=1
export WPT_ORG_MOBILE_RUNS=1
export WMF_WPT_LOCATION=us-west-1

[ -z "$WMF_WPT_KEY" ] && echo "Missing the WMF_WPT_KEY" && exit 1;
[ -z "$WPT_ORG_WPT_KEY" ] && echo "Missing the WPT_ORG_WPT_KEY" && exit 1;
[ -z "$WPT_USER" ] && echo "Missing the WPT_USER" && exit 1;
[ -z "$WPT_USER_PASSWORD" ] && echo "Missing the WPT_USER_PASSWORD" && exit 1;

node bin/index.js --batch scripts/batch/desktop.txt
node bin/index.js --batch scripts/batch/mobile.txt
node bin/index.js --batch scripts/batch/login-mobile.txt
node bin/index.js --batch scripts/batch/login-desktop.txt
node bin/index.js --batch scripts/batch/second-view-desktop.txt
node bin/index.js --batch scripts/batch/second-view-mobile.txt
node bin/index.js --batch scripts/batch/mobile-wpt-org.txt
