/**
 * @fileoverview Main file to test URLs at WebPageTest.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';
const util = require('./util');
const async = require('async');
const cli = require('./cli');
const eol = require('os').EOL;
const wpt = require('./wpt');
const bluebird = require('bluebird');
const collectMetrics = require('./collectMetrics');

module.exports = {
    /**
     * Test multiple URLs using a batch file
     * @param {array} argv The arguments for the run
     */
    runBatch: function(argv) {
        const self = this;
        const promises = [];
        const tests = util.readFile(argv.batch);
        const lines = tests.split(eol);
        lines.forEach(function(line) {
            // only run tests where we have something on that line
            if (line.indexOf('#') !== 0 &&  line.length > 1) {

                const myArgs = util.convertTextLineToMinimist(line);
                if (!cli.validateArgs(myArgs)) {
                    process.exit(1);
                }
                promises.push(
                    self.runTest(myArgs)
                );
            }
        });
        return promises;
    },

    /**
     * Test a single URL
     * @param {array} argv The arguments for the run
     * @param {function} cb The callback that will be called when the test finished
     */
    runTest: function(argv) {
        const webPageTestHost = argv.webPageTestHost;
        const arg = argv._[0];

        const input = util.getInputURLorFile(arg);

        // Note: wptOptions are changed internally when you call runTest, so
        // pollResults and timeout are changed to milliseconds so if we set the poll
        // to 10 it will be 10000, that's why we recreate the object per run :)
        const wptOptions = util.setupWPTOptions(argv);
        // read custom javascript metrics
        if (argv.customMetrics) {
            wptOptions.custom = util.readFile(argv.customMetrics);
        }

        console.log('Add job to the WebPageTest server [' + wptOptions.location + ' ' +
            wptOptions.runs + ' time(s)] for ' + arg);

        return wpt.run(webPageTestHost, argv.webPageTestKey, argv, input, wptOptions)
            .then(function(data) {
                if (Object.keys(data).length === 0) {
                    // we have had a strange case when the data is just empty from the API
                    // make sure we catch that https://phabricator.wikimedia.org/T127833
                    return bluebird.reject('We got an empty result object from WebPageTest');
                }
                console.log('Tested URL ' + data.data.url + ' for ' + data.data.location +
                ' with connectivity ' + data.data.connectivity + ' result: ' +
                data.data.summary + '&medianRun=' + argv.medianrun +
                '&medianMetric=' + wptOptions.median);

                if (argv.verbose) {
                    console.log(JSON.stringify(data, null, 1));
                }

                const collectedMetrics = collectMetrics.collect(data, argv);
                // log browser and version if it's availible
                if (data.data.median && data.data.median.firstView) {
                    const browserName = data.data.median.firstView.browser_name;
                    const browserVersion = data.data.median.firstView.browser_version;
                    // for some browsers the name and version is not availible
                    if (browserName && browserVersion) {
                        console.log('Tested using ' + browserName + ' ' + browserVersion);
                    }
                }
                const reporter = require('./reporter').get(argv.reporter);
                reporter.report(collectedMetrics, argv);

                // did we get some error, then signal it!
                // in some cases WebPageTest doesn't report an error object but the error code
                // shows an error, so lets check that
                // but WPT reports 304 as errors so make sure we don't catch them
                if (data.data.median && data.data.median.firstView &&
                    data.data.median.firstView.result > 399) {
                    return bluebird.reject('We got error code ' +
                        data.data.median.firstView.result + ' for URL ' + data.data.url +
                        ' result ' +  data.data.summary);
                }
                return;
            });
    }
};
