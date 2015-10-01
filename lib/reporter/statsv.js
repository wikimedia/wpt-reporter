/**
 * @fileoverview Report the metrics to statsv.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';
var request = require('request');

module.exports = {
    /**
     * Validate the input arguments.
     * @param {array} argv The input parameters for the run.
     * @return {boolean} returns true if the argumenst are ok.
     */
    validate: function(argv) {
        return true;
    },
    /**
     * Log help arguments to the console.
     */
    help: function() {
        console.log('   --endpoint           Where to send the statsv metrics ' +
            '[https://www.example.com]');
    },
    /**
     * Report the metrics by sending them to statsv.
     * @param {object} collectedMetrics The metrics collected from the run.
     * @param {array} argv The input parameters for the run.
     */
    report: function(metrics, argv) {
        var endpoint = argv.endpoint || 'https://www.example.com';
        var flatten = {};
        // flatten the structure
        Object.keys(metrics).forEach(function(type) {
            Object.keys(metrics[type]).forEach(function(metric) {
                flatten[metric] = metrics[type][metric] + ((type === 'timings') ? 'ms' : 'g');
            });
        });


        // Lets do something smarter in the future, now
        // cut after 5 keys and send a new request
        var MAX_KEYS_PER_REQUEST = 5;
        var url = endpoint + '?';

        var keys = Object.keys(flatten);
        for (var i = 0; i < keys.length; i++) {

            url += keys[i] + '=' + flatten[keys[i]] + '&';
            // don't send first, and then for each MAX_KEYS_PER_REQUEST
            // and the last time
            if (i !== 0 && i % MAX_KEYS_PER_REQUEST === 0 || (i + 1 === flatten.length)) {
                url = url.slice(0, -1);
                console.log(url);
                request(url, function(error, response, body) { // jshint unused:false
                    if (!error) {
                        console.log('Succesfully sent metrics.');
                    } else {
                        // default testing to localhost, then skip error logging
                        if (endpoint.indexOf('http://localhost') === -1) {
                            console.error(error);
                        }
                    }
                });
                url = endpoint + '?';
            }
        }
    }
};
