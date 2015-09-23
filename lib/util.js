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
var minimist = require('minimist');

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
                        console.log('Succesfully sent metrics.');
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
            label: argv.label ? this.getTodaysDate() + '-' + argv.label : this.getTodaysDate(),
            runs: 11
        };

        Object.keys(argv).forEach(function(param) {
            if (['webPageTestKey', 'webPageTestHost', '_', 'verbose', 'userStatus',
            'sendMetrics', 'customMetrics', 'namespace', 'batch', 'label'].indexOf(param) === -1) {
                wptOptions[param] = argv[param];
            }
        });

        return wptOptions;
    },
    convertTextLineToMinimist: function(line) {
        // replace variables with env variables
        line = this.replaceWithEnv(line);
        // the location element for WebPageTest has a couple of different
        // variants: http://www.webpagetest.org/getLocations.php
        // most problem for us is the space that sometimes is in the name
        // so for now: remove location before parse and then add it again

        var location = '';
        var locationLine = line.match(/--location(.*?)(?=\s--)/g);
        if (locationLine) {
            line = line.split(locationLine[0] + ' ').join('');
            location = locationLine[0].replace('--location ','');
        }
        var myArgs = minimist(line.split(' '), {
            boolean: ['sendMetrics','verbose']
        });

        // insert the location again
        if (locationLine) {
            myArgs.location = location;
        }
        return myArgs;
    },
    readFile: function(filename) {
        var fullPathToFile = (filename.charAt(0) === path.sep) ? filename : path.join(process.cwd(),
          path.sep, filename);
        return fs.readFileSync(fullPathToFile, 'utf-8');
    },
    replaceWithEnv: function(text) {
        var matches = text.match(/<(.*?)>/g);
        if (matches) {
            matches.forEach(function(match) {
                // do we have a matching ENV?
                var env = match.substring(2, match.length - 1);
                if (process.env[env]) {
                    text = text.replace(match, process.env[env]);
                } else {
                    console.error('No ENV set for ' + env + ' the expr ' + match +
                    ' will not be replaced');
                }

            });
        }
        return text;
    },
    collectMetrics: function(wptJson, userStatus, namespace, argv) {

        var self = this;
        var metricsToSend = {};

        var emulateMobile = argv.emulateMobile;
        var firstViewOnly = argv.first;

        var views = ['firstView'];
        if (!firstViewOnly) {
            views.push('repeatView');
        }

        views.forEach(function(view) {
            // if we are missing browser info from WPT (happens when using MotoG at least)
            //  use a normalized version of the location
            // the browser/location can then look like Dulles_MotoG_Motorola_G___Chrome
            // but since there are no standard of naming it should be ok to just use what we got
            var browser = BROWSERS[wptJson.data.median[view].browser_name] ||
             wptJson.data.location.replace(/[^A-Za-z_0-9]/g, '_');

            if (emulateMobile) {
                browser += '-emulateMobile';
            }

            // the actual location is the first part of the location string
            // separated by either a : or _
            var location = wptJson.data.location.split(/:|_/)[0];

            var keyStart = namespace + '.' + location + '.' + userStatus + '.' + browser +
            '.' + view + '.';

            self.METRICS.forEach(function(metric) {
                metricsToSend[keyStart + metric ] = wptJson.data.median[view][metric] + 'ms';
            });

            if (wptJson.data.median[view].userTimes) {
                Object.keys(wptJson.data.median[view].userTimes).forEach(function(userTiming) {
                    metricsToSend[keyStart + userTiming ] =
                    wptJson.data.median[view].userTimes[userTiming] +
                    'ms';
                });
            }

            // collect sizes & assets
            self.ASSET_TYPES.forEach(function(assetType) {
                metricsToSend[keyStart +
                assetType + '.requests' ] = wptJson.data.median[view].breakdown[assetType].requests;
                metricsToSend[keyStart +
                assetType + '.bytes' ] = wptJson.data.median[view].breakdown[assetType].bytes;
            });

        });

        return metricsToSend;
    },
    getTodaysDate: function() {

        function addPadding(number) {
            number = number.toString();
            if (number.length === 1) {
                return '0' + number;
            }
            return number;
        }

        var date = new Date();
        var month = addPadding(date.getUTCMonth() + 1);
        var day =  addPadding(date.getUTCDate());
        var hours = addPadding(date.getUTCHours());
        var minutes = addPadding(date.getUTCMinutes());

        return date.getUTCFullYear() + '-' + month + '-' + day + ' ' + hours + '.' + minutes;
    },
};
