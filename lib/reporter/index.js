/**
 * @fileoverview Hold and know which reporters that exists.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';

var csv = require('./csv');
var json = require('./json');
var statsv = require('./statsv');
var graphite = require('./graphite');

var reporters = {
    csv: csv,
    json: json,
    graphite: graphite,
    statsv: statsv
};

/**
 * Get all reporters that exists
 * @return {object} key/value for all reporters.
 */
module.exports.getReporters = function() {
    return reporters;
};

/**
 * Get a specifc reporter.
 * @param {string} the name of the reporter
 * @return {object} the reporter and null if the name doesn't matcj
 */
module.exports.get = function(name) {
    var reporter = reporters[name];

    if (!reporter) {
        return null;
    }

    return reporter;
};
