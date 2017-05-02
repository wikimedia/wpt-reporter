/**
 * @fileoverview Report the metrics as JSON.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';
module.exports = {
    /**
     * Validate the input arguments.
     * @param {array} argv The input parameters for the run.
     * @return {boolean} returns true if the argumenst are ok.
     */
    validate: function() {
        return true;
    },
    /**
     * Log help arguments to the console.
     */
    help: function() {

    },
    /**
     * Report the metrics by writing them as JSON.
     * @param {object} collectedMetrics The metrics collected from the run.
     * @param {array} argv The input parameters for the run.
     */
    report: function(metrics) {
        console.log(JSON.stringify(metrics, null, 2));
    }
};
