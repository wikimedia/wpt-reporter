/**
 * @fileoverview Hold and know which reporters that exists.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';

const csv = require('./csv');
const json = require('./json');
const statsv = require('./statsv');
const graphite = require('./graphite');

const reporters = {
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
    const reporter = reporters[name];

    if (!reporter) {
        return null;
    }

    return reporter;
};
