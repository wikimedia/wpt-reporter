/**
 * @fileoverview Main file to test URLs at WebPageTest.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';
var util = require('./util');
var async = require('async');
var cli = require('./cli');
var eol = require('os').EOL;
var wpt = require('./wpt');
var collectMetrics = require('./collectMetrics');
module.exports = {
    /**
     * Test multiple URLs using a batch file
     * @param {array} argv The arguments for the run
     */
    runBatch: function(argv, cb) {
        var callback = cb || function() {};
        var self = this;
        var series = [];
        var tests = util.readFile(argv.batch);
        var lines = tests.split(eol);
        lines.forEach(function(line) {
            // only run tests where we have something on that line
            if (line.indexOf('#') !== 0 &&  line.length > 1) {

                var myArgs = util.convertTextLineToMinimist(line);
                if (!cli.validateArgs(myArgs)) {
                    process.exit(1);
                }
                series.push(function(callback) {
                    self.runTest(myArgs, callback);
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
                    console.error('Couldn\'t execute all the runs.');
                } else {
                    console.log('Succesfully run ' + series.length + ' tests.');
                }
                callback(err);
            });
    },

    /**
     * Test a single URL
     * @param {array} argv The arguments for the run
     * @param {function} cb The callback that will be called when the test finished
     */
    runTest: function(argv, cb) {
        var callback = cb || function() {};
        var webPageTestHost = argv.webPageTestHost;
        var arg = argv._[0];

        var input = util.getInputURLorFile(arg);

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

        wpt.run(webPageTestHost, argv.webPageTestKey, argv, input, wptOptions, function(err, data) {

            if (err) {
                // the errors from the WebPageTest API can be a little confusing
                // but lets hope there is always an error when it doesn't work
                console.error('Couldn\'t fetch data from WebPageTest' + err);
                // lets report back using our internal reporting
                // so we don't break the next/coming runs
                return callback({});
            }
            var collectedMetrics = collectMetrics.collect(data, argv);
            // log browser and version if it's availible
            if (data.data.median && data.data.median.firstView) {
                var browserName = data.data.median.firstView.browser_name;
                var browserVersion = data.data.median.firstView.browser_version;
                // for some browsers the name and version is not availible
                if (browserName && browserVersion) {
                    console.log('Tested using ' + browserName + ' ' + browserVersion);
                }
            }
            var reporter = require('./reporter').get(argv.reporter);
            reporter.report(collectedMetrics, argv);

            // did we get some error, then signal it!
            // in some cases WebPageTest doesn't report an error object but the error code
            // shows an error, so lets check that
            if (data.data.median && data.data.median.firstView &&
               data.data.median.firstView.result > 0) {
                return callback({});
            }
            return callback();
        });
    }
};
