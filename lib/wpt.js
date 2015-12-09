/**
 * @fileoverview The functionallity to fetch data from WebPageTest.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';

var WebPageTest = require('webpagetest');

module.exports = {
    run: function(host, key, argv, input, wptOptions, cb) {
        var wpt = new WebPageTest(host, key);

        wpt.runTest(input, wptOptions, function(err, data) {

            if (argv.verbose) {
                console.log(JSON.stringify(data, null, 1));
            }

            if (err) {
                console.error('Couldn\'t fetch data from WebPageTest:' + JSON.stringify(err));
                console.error('Configuration:' + JSON.stringify(wptOptions, null, 2));
                cb(err);
                return;
            }

            console.log('WebPageTest run: ' + data.data.summary);
            cb(null, data);
        });

    }
};
