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

var util = require('../lib/util'),
  assert = require('assert'),
  mobileJson = JSON.parse(util.readFile('test/files/mobile_result.json')),
  desktopJson = JSON.parse(util.readFile('test/files/desktop_result.json'));

describe('Test util', function() {

  it('WebPageTest options should be added', function() {

    var args = {
      location: 'ap-northeast-1_IE10',
      connectivity: '3G'
    };
    var wptOptions = util.setupWPTOptions(args);
    assert.deepEqual(wptOptions.location, 'ap-northeast-1_IE10');
    assert.deepEqual(wptOptions.connectivity, '3G');
  });

  it('Parameters specific for wptstatsv should be cleaned out from WebPageTest options', function() {

    var keysToBeRemoved = ['webPageTestKey', 'webPageTestHost', '_', 'verbose', 'userStatus', 'dryRun', 'customMetrics', 'namespace'];
    var args = {
      webPageTestKey: 'aSupERSecrEtKey',
      webPageTestHost: 'http://our.wpt.org',
      _: ['all', 'extra', 'args'],
      verbose: true,
      userStatus: 'anonymous',
      dryRun: true,
      customMetrics: 'javascript that collects custom metrics',
      namespace: 'super.special.namespace'
    };

    var wptOptions = util.setupWPTOptions(args);
    keysToBeRemoved.forEach(function(key) {
      assert.strictEqual(wptOptions[key], undefined);
    });

  });

  it('We should be able to parse a JSON from WebPageTest collecting data from mobile', function() {
    var userStatus = 'anonymous';
    var namespace = 'webpagetest';
    var metrics = util.collectMetrics(mobileJson, userStatus, namespace);
    metrics.forEach(function(metric) {
      // verify that we aren't fetching any undefined values = values missing in the WPT file
      assert.strictEqual(metric.indexOf('undefined'),-1,'We have an undefined value in ' + metric);
    });

    // verify that we collect all the metrics that we want
    util.METRICS.forEach(function(definedMetric) {
        var metricIncluded = false;
        metrics.forEach(function(metric) {
          if (metric.indexOf(definedMetric) > -1) {
            metricIncluded = true;
          }
        });
        assert.strictEqual(metricIncluded, true, 'We are missing metric ' + definedMetric);
    });



  });

  it('We should be able to parse a JSON from WebPageTest collecting data from desktop', function() {

    var userStatus = 'anonymous';
    var namespace = 'webpagetest';
    var metrics = util.collectMetrics(desktopJson, userStatus, namespace);
    metrics.forEach(function(metric) {
      // verify that we aren't fetching any undefined values = values missing in the WPT file
      assert.strictEqual(metric.indexOf('undefined'),-1,'We have an undefined value in ' + metric);
    });

    // verify that we collect all the metrics that we want
    util.METRICS.forEach(function(definedMetric) {
        var metricIncluded = false;
        metrics.forEach(function(metric) {
          if (metric.indexOf(definedMetric) > -1) {
            metricIncluded = true;
          }
        });
        assert.strictEqual(metricIncluded, true, 'We are missing metric ' + definedMetric);
    });

  });

});
