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
var minimist = require('minimist');
var util = require('./util');
var async = require('async');
var cli = require('./cli');
var eol = require('os').EOL;

var DEFAULT_USER_STATUS = 'anonymous';
var DEFAULT_NAMESPACE = 'webpagetest';

var argv = minimist(process.argv.slice(2), {
    boolean: ['sendMetrics','verbose']
});

function runBatch(argv) {
    var series = [];
    var tests = util.readFile(argv.batch);
    var lines = tests.split(eol);
    lines.forEach(function(line) {
      // only run tests where we have something on that line
      if (line.indexOf('#') !== 0 &&  line.length > 1) {

          var myArgs = util.convertTextLineToMinimist(line);
          if (!cli.isArgsOK(myArgs)) {
              process.exit(1);
          }
          series.push(function(callback) {
              runTest(myArgs, callback);
          });
      }
  });
    // lets run the tests one by one after each other. in that way
    // the wait time you configure (how long time you wait until a test is finished)
    // is more logical, meaning the configured time is per test and not for a
    // whole test suite.
    async.series(series, // jshint unused:false
      function(err, results) {
          if (err) {
              console.error('Couldn\'t execute all the runs' + err);
          } else {
              console.log('Succesfully run ' + series.length + ' tests.');
          }
      });
}

function runTest(argv, cb) {
    var callback = cb || function() {};
    var endpoint = argv.endpoint || 'https://www.example.com';
    var webPageTestHost = argv.webPageTestHost ||  'http://wpt.wmftest.org';
    var wpt = new WebPageTest(webPageTestHost, argv.webPageTestKey);
    var userStatus = argv.userStatus || DEFAULT_USER_STATUS;
    var namespace = argv.namespace ||  DEFAULT_NAMESPACE;

    var arg = argv._[0];

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

        if (argv.verbose) {
            console.log(JSON.stringify(data));
        }

        if (err) {
            console.error('Couldn\'t fetch data from WebPageTest:' + JSON.stringify(err));
            console.error('Configuration:' + JSON.stringify(wptOptions, null, 2));
            callback();
            return;
        }

        console.log('WebPageTest run: ' + data.data.summary);
        var collectedMetrics = util.collectMetrics(data, userStatus, namespace);
        if (argv.sendMetrics) {
            util.sendMetrics(collectedMetrics, endpoint);
        } else {
            console.log('Dry run: ' + JSON.stringify(collectedMetrics, null, 2));
        }
        callback();
    });
}
// ----  Main

if (argv.help) {
    cli.help();
    process.exit(0);
}

if (!cli.isArgsOK(argv)) {
    process.exit(1);
}

if (argv.batch) {
    runBatch(argv);
} else {
    runTest(argv);
}
