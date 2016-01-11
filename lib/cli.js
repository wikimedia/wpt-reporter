/**
 * @fileoverview Command line helper methods.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';

var reporters = require('./reporter');
var minimist = require('minimist');

var DEFAULT_LOCATION = 'Dulles:Chrome';
var DEFAULT_CONNECTIVITY = 'Cable';
var DEFAULT_WEBPAGETEST_HOST = 'www.webpagetest.org';
var DEFAULT_NAMESPACE = 'webpagetest';
var DEFAULT_MEDIANRUN = 'fastest';
// Here are the values we collect. Want to add more? Check the JSON that is returned:
// https://sites.google.com/a/webpagetest.org/docs/advanced-features/webpagetest-restful-apis
// #TOC-Sample
// Not 100% sure it's the latest though. Test by logging the output from WebPageTest
// Note: It can differ depending on what agent that runs the tests.
var DEFAULT_METRICS = 'SpeedIndex,render,TTFB,fullyLoaded';

module.exports = {
    /**
     * Print the options to the console.
     */
    help: function() {
        console.log(' Thin wrapper for the WebPageTest API that reports metrics in different' +
        ' formats.\n');
        console.log(' Usage: ' + process.argv[1] + ' [options] [URL/scriptFile]');
        console.log(' Supply a file when you want to script WebPageTest ' +
            'https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/scripting.');
        console.log(' You can test multiple URL:s (or files) using the batch option: [options]' +
            '--batch ' + '[file]\n');
        console.log(' Options:');
        console.log('   --webPageTestKey     The secret key for the WebPageTest instance ' +
            '[required]');
        console.log('   --batch              The path to a file containing multiple URLs to test.');
        console.log('   --location           The location and browser to use, check ' +
            ' http://webPageTestHost/getLocations.php. [' + DEFAULT_LOCATION + ']');
        console.log('   --connectivity       Connectivity profile ' +
            '(Cable|DSL|FIOS|Dial|3G|3GFast|Native|custom) [' + DEFAULT_CONNECTIVITY + ']');
        console.log('   --runs               Number of test runs [11]');
        console.log('   --webPageTestHost    The host of where to run your test. ' +
            '[' + DEFAULT_WEBPAGETEST_HOST + ']');
        console.log('   --timeout            The timeout in seconds until we end the test. Zero ' +
        'is forever [0] ');
        console.log('   --reporter           Choose how you want to report the metrics ' +
            '[csv|json|graphite|statsv] ');
        console.log('   --customMetrics      A file with custom WPT metrics. ' +
            'https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/custom-metrics ');
        console.log('   --verbose            Log the full JSON from WebPageTest to the console');
        console.log('   --namespace          The namespace of the keys ' +
            '[' + DEFAULT_NAMESPACE + ']');
        console.log('   --metrics            A list of metrics to collect from the median run ' +
            '[' + DEFAULT_METRICS + ']');
        console.log('   --medianrun          Choose what run to use as median (a.k.a pick fastest'
        + 'or median) [' + DEFAULT_MEDIANRUN + ']');
        Object.keys(reporters.getReporters()).forEach(function(name) {
            reporters.get(name).help();
        });

        console.log(' For a full list of options, check ' +
            'https://github.com/marcelduran/webpagetest-api#test-works-for-runtest-method-only\n');
    },
    /**
     * Validate the input arguments.
     * @param {array} argv The input parameters for the run.
     * @return {boolean} returns true if the argumenst are ok.
     */
    validateArgs: function(argv) {
        if (argv.batch) {
            // if it is batch job then test the parameters per line
            console.log('Batch test URLs/scripts from ' + argv.batch);
        } else if (!argv.webPageTestKey) {
            console.error('Missing parameter --webPageTestKey');
            return false;
        } else if (argv._.length === 0) {
            console.error('Missing URL or file as an argument. Supply the URL to test or a file ' +
                'with a scripted test');
            return false;
        } else if (argv._length > 1) {
            console.error('There are ' + argv._length + ' arguments passed to the script (one is' +
                ' enough). Could there be extra spaces in your parameter list?');
            return false;
        }
        if (!argv.batch) {
            if (!argv.reporter) {
                console.error('Missing reporter. Needs to be one of [' +
                    Object.keys(reporters.getReporters()) + ']');
                return false;
            }

            var reporter = reporters.get(argv.reporter);
            if (!reporter) {
                console.error('There\'s no matching reporter for ' + argv.reporter);
                return false;
            }

            var isOK = reporter.validate(argv);
            if (!isOK) {
                return isOK;
            }
        }

        return true;
    },
    /**
     * Convert an array of data to a minimist argv.
     * @param {array} arg the array to be converted.
     * @return {object} the minimist argv object.
     */
    getMinimistArgv: function(arg) {
        return minimist(arg, {
            default: {
                connectivity: DEFAULT_CONNECTIVITY,
                location: DEFAULT_LOCATION,
                webPageTestHost: DEFAULT_WEBPAGETEST_HOST,
                metrics: DEFAULT_METRICS,
                namespace: DEFAULT_NAMESPACE,
                medianrun: DEFAULT_MEDIANRUN
            }
        });
    }
};
