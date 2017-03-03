var cm = require('../lib/collectMetrics');
var assert = require('assert');
var util = require('../lib/util');
var cli = require('../lib/cli');
var mobileJson = JSON.parse(util.readFile('test/files/mobile_result.json'));
var desktopJson = JSON.parse(util.readFile('test/files/desktop_result.json'));

describe('Test colllect metrics', function() {

    it('We should be able to parse a JSON from WebPageTest collecting data from desktop',
    function() {
        var namespace = 'webpagetest';
        var metrics = cm.collect(desktopJson, cli.getMinimistArgv([]));
        Object.keys(metrics).forEach(function(type) {
          Object.keys(metrics[type]).forEach(function(key) {
              assert.strictEqual(metrics[type][key].toString().indexOf('undefined'), -1,
              'We have an undefined value in ' + key);
          });
      });

        // verify that we collect all the metrics that we want
        ['SpeedIndex','render','TTFB','fullyLoaded','lastVisualChange','domElements'].forEach(function(definedMetric) {
          var metricIncluded = false;
          Object.keys(metrics).forEach(function(type) {
              Object.keys(metrics[type]).forEach(function(key) {
                  if (key.indexOf(definedMetric) > -1) {
                      metricIncluded = true;
                  }
              });
          });
          assert.strictEqual(metricIncluded, true, 'We are missing metric ' + definedMetric);
      });

        // verify that we collect all the metrics that we want
        ['html','js','css','font','flash','other'].forEach(function(definedMetric) {
          var metricIncluded = false;
          Object.keys(metrics).forEach(function(type) {
              Object.keys(metrics[type]).forEach(function(key) {
                  if (key.indexOf(definedMetric) > -1) {
                      metricIncluded = true;
                  }
              });
          });
          assert.strictEqual(metricIncluded, true, 'We are missing asset type ' + definedMetric);
      });
    });

    it('We should be able to parse a JSON from WebPageTest collecting data from mobile',
    function() {
        var namespace = 'webpagetest';
        var metrics = cm.collect(mobileJson, cli.getMinimistArgv([]));
        Object.keys(metrics).forEach(function(type) {
            Object.keys(metrics[type]).forEach(function(key) {
                // verify that we aren't fetching any undefined values =
                // values missing in the WPT file
                assert.strictEqual(metrics[type][key].toString().indexOf('undefined'), -1,
                'We have an undefined value in ' + key);
            });
        });

        // verify that we collect all the metrics that we want
        ['SpeedIndex','render','TTFB','fullyLoaded','lastVisualChange','domElements'].forEach(function(definedMetric) {
            var metricIncluded = false;
            Object.keys(metrics).forEach(function(type) {
                Object.keys(metrics[type]).forEach(function(key) {
                    if (key.indexOf(definedMetric) > -1) {
                        metricIncluded = true;
                    }
                });
            });
            assert.strictEqual(metricIncluded, true, 'We are missing metric ' + definedMetric);
        });
    });
});
