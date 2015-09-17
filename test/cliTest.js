/*
wptstatsv
~~~~~~~
A thin wrapper for the WebPageTest API that sends metrics to statsv.

Copyright 2015 Peter Hedenskog <phedenskog@wikimedia.org>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

var cli = require('../lib/cli'),
assert = require('assert');

// var apa = require("mocha-jscs")(["./lib"]);

describe('Test cli', function() {

    it('Adding a URL should return a URL', function() {

        var arg = 'https://www.wikipedia.org';
        var value = cli.getInputURLorFile(arg);
        assert.deepEqual(value, arg);
    });

    it('Adding a file should return a file', function() {
        var arg = 'test/files/scripting.txt';
        var fileContent = cli.getInputURLorFile(arg);
    });

    it('Missing an URL should tell us input parameters is not ok', function() {
        var argv = {};
        argv._ = [];
        assert.strictEqual(cli.validateArgs(argv),false);
    });

    it('Missing WebPageTestKey should tell us input is not ok', function() {
        var argv = {};
        argv._ = ['https://www.wikipedia.org/'];
        assert.strictEqual(cli.validateArgs(argv),false);
    });

    it('Having both WebPageTestKey and a URL should be ok', function() {
        var argv = { webPageTestKey: 'thisIsMySuperSecretKey' };
        argv._ = ['https://www.wikipedia.org/'];
        assert.strictEqual(cli.validateArgs(argv),true);
    });


});
