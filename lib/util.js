/*
wptstatsv
~~~~~~~
A thin wrapper for the WebPageTest API that sends metrics to statsv.

Copyright 2015 Peter Hedenskog <phedenskog@wikimedia.org>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

var request = require('request');
var fs = require('fs');
var path = require('path');

var VIEWS = ['firstView', 'repeatView'];
var NAMESPACE = 'webpagetest';
var BROWSERS = {
    'Google Chrome': 'chrome',
    Firefox: 'firefox',
    'Internet Explorer': 'ie',
    Safari: 'safari'
};


module.exports = {
    // Here are the values we collect. Want to add more? Check the JSON that is returned:
    // https://sites.google.com/a/webpagetest.org/docs/advanced-features/webpagetest-restful-apis
    // #TOC-Sample
    // Not 100% sure it's the latest though. Test by logging the output from WebPageTest
    // Note: It can differs depending on what agent that runs the tests.
    // Note 2: Make sure we don't hit the statsv limit of maximum chars in one request
    METRICS: ['SpeedIndex', 'render', 'TTFB', 'fullyLoaded'],
    ASSET_TYPES: ['html','js','css','image'],
    sendMetrics: function(metrics, endpoint) {

        // Lets do something smarter in the future, now
        // cut after 5 keys and send a new request
        var MAX_KEYS_PER_REQUEST = 5;
        var url = endpoint + '?';

        var keys = Object.keys(metrics);
        for (var i = 0; i < keys.length; i++) {

            url += keys[i] + '=' + metrics[keys[i]] + '&';
            // don't send first, and then for each MAX_KEYS_PER_REQUEST
            // and the last time
            if (i !== 0 && i % MAX_KEYS_PER_REQUEST === 0 || (i - 1 === keys.length)) {
                url = url.slice(0, -1);
                request(url, function(error, response, body) { // jshint unused:false
                    if (!error) {
                        console.log('Succesfully sent metrics to ' + url);
                    } else {
                        console.error(error);
                    }
                });
                url = endpoint + '?';
            }
        }
    },
    setupWPTOptions: function(argv) {
        // some default options here
        var wptOptions = {
            pollResults: 10,
            timeout: 1200,
            location: 'us-east-1:Chrome',
            video: 'true',
            runs: 11
        };

        Object.keys(argv).forEach(function(param) {
            if (['webPageTestKey', 'webPageTestHost', '_', 'verbose', 'userStatus',
            'sendMetrics', 'customMetrics', 'namespace'].indexOf(param) === -1) {
                wptOptions[param] = argv[param];
            }
        });

        return wptOptions;
    },
    readFile: function(filename) {
        var fullPathToFile = (filename.charAt(0) === path.sep) ? filename : path.join(process.cwd(),
          path.sep, filename);
        return fs.readFileSync(fullPathToFile, 'utf-8');
    },
    collectMetrics: function(wptJson, userStatus, namespace) {

        var self = this;
        var metricsToSend = {};

        VIEWS.forEach(function(view) {
            // if we are missing browser info from WPT (happens when using MotoG at least)
            //  use a normalized version of the location
            // the browser/location can then look like Dulles_MotoG_Motorola_G___Chrome
            // but since there are no standard of naming it should be ok to just use what we got
            var browser = BROWSERS[wptJson.data.median[view].browser_name] ||
             wptJson.data.location.replace(/[^A-Za-z_]/g, '_');

            self.METRICS.forEach(function(metric) {
                metricsToSend[namespace + '.' + userStatus + '.' + browser + '.' + view +
                '.' + metric] =  wptJson.data.median[view][metric] + 'ms';
            });

            if (wptJson.data.median.firstView.userTimes) {
                Object.keys(wptJson.data.median.firstView.userTimes).forEach(function(userTiming) {
                    metricsToSend[namespace + '.' + userStatus + '.' + browser + '.' + view +
                   '.' + userTiming ] =  wptJson.data.median[view].userTimes[userTiming] +
                    'ms';
                });
            }

            // collect sizes & assets
            self.ASSET_TYPES.forEach(function(assetType) {
                metricsToSend[namespace + '.' + userStatus + '.' + browser + '.' + view + '.' +
                assetType + '.requests' ] = wptJson.data.median[view].breakdown[assetType].requests;
                metricsToSend[namespace + '.' + userStatus + '.' + browser + '.' + view + '.' +
                assetType + '.bytes' ] = wptJson.data.median[view].breakdown[assetType].bytes;
            });

        });

        return metricsToSend;
    }
};
