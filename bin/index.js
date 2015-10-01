#!/usr/bin/env node

/**
 * @fileoverview The bin file to run.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';
var minimist = require('minimist');
var cli = require('../lib/cli');
var wpt = require('../lib/index');

var argv = cli.getMinimistArgv(process.argv.slice(2));

if (argv.help) {
    cli.help();
    process.exit(0);
}

if (!cli.validateArgs(argv)) {
    process.exit(1);
}

if (argv.batch) {
    wpt.runBatch(argv);
} else {
    wpt.runTest(argv);
}
