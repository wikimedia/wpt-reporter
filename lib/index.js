#!/usr/bin/env node

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

var WebPageTest = require('webpagetest');
var argv = require('minimist')(process.argv.slice(2), { boolean: 'sendMetrics' });
var util = require('./util');
var async = require('async');
var cli = require('./cli');

var DEFAULT_USER_STATUS = 'anonymous';
var DEFAULT_NAMESPACE = 'webpagetest';

if (argv.help) {
    cli.help();
    process.exit(0);
}

if (!cli.isArgsOK(argv)) {
    process.exit(1);
}

var endpoint = argv.endpoint || 'https://www.wikimedia.org/beacon/statsv';
var webPageTestHost = argv.webPageTestHost ||  'http://wpt.wmftest.org';
var wpt = new WebPageTest(webPageTestHost, argv.webPageTestKey);
var wptOptions = util.setupWPTOptions(argv);

// read custom javascript metrics
if (argv.customMetrics) {
    wptOptions.custom = util.readFile(argv.customMetrics);
}

var userStatus = argv.userStatus || DEFAULT_USER_STATUS;
var namespace = argv.namespace || DEFAULT_NAMESPACE;

var series = [];
argv._.forEach(function(arg)  {

    series.push(function(callback) {

        var input = cli.getInputURLorFile(arg);

        // Note: wptOptions are changed internally when you call runTest, so
        // pollResults and timeout are changed to milliseconds so if we set the poll
        // to 10 it will be 10000, that's why we recreate the object per run :)
        var wptOptions = util.setupWPTOptions(argv);
        // read custom javascript metrics
        if (argv.customMetrics) {
            wptOptions.custom = util.readFile(argv.customMetrics);
        }

        console.log('Running WebPageTest [' + wptOptions.location + ' ' + wptOptions.runs +
        ' time(s)] for ' + arg);

        wpt.runTest(input, wptOptions, function(err, data) {

            if (err) {
                console.error('Couldn\'t fetch data from WebPageTest:' + JSON.stringify(err));
                console.error('Configuration:' + JSON.stringify(wptOptions));
            } else {

                if (argv.verbose) {
                    console.log(JSON.stringify(data));
                }

                var collectedMetrics = util.collectMetrics(data, userStatus, namespace);
                if (argv.sendMetrics) {
                    util.sendMetrics(collectedMetrics, endpoint);
                } else {
                    console.log('Dry run:' + collectedMetrics);
                }
                callback();
            }
        });
    });
});

// lets run the tests one by one after each other. in that way
// the wait time you configure (how long time you wait until a test is finished)
// is more logical, meaning the configured time is per test and not for a
// whole test suite.

async.series(series,  // jshint unused:false
  // optional callback
  function(err, results) {
      if (err) {
          console.error('Couldn\'t execute all the runs' + err);
      }      else {
          console.log('Succesfully run ' + series.length + ' tests.');
      }
  });
