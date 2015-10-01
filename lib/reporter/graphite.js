/**
 * @fileoverview Report the metrics to Graphite.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peterwikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';

var net = require('net');

module.exports = {
    /**
     * Validate the input arguments.
     * @param {array} argv The input parameters for the run.
     * @return {boolean} returns true if the argumenst are ok.
     */
    validate: function(argv) {
        if (!argv.graphiteHost) {
            console.error('Missing configuration for --graphiteHost');
        }
        return true;
    },
    /**
     * Log help arguments to the console.
     */
    help: function() {
        console.log('   --graphiteHost       The Graphite hostname');
        console.log('   --graphitePort       The Graphite port [2003]');
    },
    /**
     * Report the metrics by writing them as JSON.
     * @param {object} collectedMetrics The metrics collected from the run.
     * @param {array} argv The input parameters for the run.
     */
    report: function(metrics, argv) {
        var port = argv.graphitePort || 2003;
        var host = argv.graphiteHost;
        var server = net.createConnection(port, host);
        server.addListener('error', function(error) {
            console.error('Could not send data to Graphite:' + error);
        });

        var timeStamp = ' ' + Math.round(new Date().getTime() / 1000) + '\n';
        var data = '';
        Object.keys(metrics).forEach(function(type) {
            Object.keys(metrics[type]).forEach(function(metric) {
                data += metric + ' ' + metrics[type][metric] + timeStamp;
            });
        });

        if (argv.verbose) {
            console.log(data);
        }

        server.on('connect', function() {
            this.write(data);
            this.end();
        });
    }
};
