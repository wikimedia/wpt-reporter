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

var util = require('./util');

var AVAILIBLE_USER_STATUS = ['anonymous', 'authenticated'];

module.exports = {

  // TODO add extra namespace  (key?)
  help: function() {
    console.log(' Thin wrapper for the WebPageTest API that sends metrics to statsv.\n');
    console.log(' Usage: ' + process.argv[1] + ' [options] [URL/file]');
    console.log(' Supply a file when you want to script WebPageTest https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/scripting.\n')
    console.log(' Options:');
    console.log('   --webPageTestKey     The secret key for the WebPageTest instance [required]');
    console.log('   --namespace          The namespace of the key sent to statsv. [webpagetest]');
    console.log('   --location           The location and browser to use, check http://wpt.wmftest.org/getLocations.php [us-west-2:Chrome]');
    console.log('   --connectivity       Connectivity profile (Cable|DSL|FIOS|Dial|3G|3GFast|Native|custom) [Cable]');
    console.log('   --runs               Number of test runs [11]');
    console.log('   --webPageTestHost    The host of where to run your test. [http://wpt.wmftest.org]')
    console.log('   --timeout            The timeout in seconds until we end the test [1200]');
    console.log('   --userStatus         Is the user logged in or not? Used in the namespace (anonymous|authenticated) [anonymous]');
    console.log('   --endpoint           Where to send the statsv metrics [https://www.wikimedia.org/beacon/statsv]');
    console.log('   --dryRun             Send metrics to statsv or not. Set to anything if you don\'t wanna send metrics.');
    console.log('   --customMetrics      A file with custom WPT metrics. https://sites.google.com/a/webpagetest.org/docs/using-webpagetest/custom-metrics ')
    console.log('   --verbose            Log the full JSON from WebPageTest to the console\n');
    console.log(' For a full list of options, check https://github.com/marcelduran/webpagetest-api#test-works-for-runtest-method-only\n');
  },
  isArgsOK: function(argv) {

    if (!argv.webPageTestKey ||  argv._.length === 0) {
      console.error('Missing parameter --webPageTestKey or missing an URL/file');
      return false;
    }

    if (argv.userStatus && AVAILIBLE_USER_STATUS.indexOf(argv.userStatus) === -1) {
      console.error('Not a valid user status:' + argv.userStatus + ' Needs to be one of [' + AVAILIBLE_USER_STATUS + ']');
      return false;
    }
    return true;
  },
  getInputURLorFile: function(arg) {
    // is it a file or URL we wanna test?
    if (arg.indexOf('http') === -1) {
      return util.readFile(arg);
    } else {
      return arg;
    }
  }
};
