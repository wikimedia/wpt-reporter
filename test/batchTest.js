var underTest = require('../lib/');
var mockery = require('mockery');
var assert = require('assert');
var util = require('../lib/util');
var Promise = require('bluebird');
var desktopJson = JSON.parse(util.readFile('test/files/desktop_result.json'));
var failingDesktopJson = JSON.parse(util.readFile('test/files/desktop_result_failing.json'));

var wptMock = {
    run: function(host, key, argv, input, wptOptions) {
        return new Promise(function(resolve, reject) {
          resolve(desktopJson);
      });
    }
};

var wptFailingMock = {
    run: function(host, key, argv, input, wptOptions) {
        return new Promise(function(resolve, reject) {
        reject();
    });
    }
};

mockery.registerAllowable(underTest);

describe('Test the batch functionality', function() {

    describe('When the tests in WebPageTest is working', function() {
        before(function() {
            mockery.registerMock('./wpt', wptMock);
            mockery.enable({
                useCleanCache: true,
                warnOnReplace: false,
                warnOnUnregistered: false
            });
        });
        it('A batch file should run through cleanly', function(done) {
            var argv = {
                batch: 'test/files/batch.txt'
            };
            var test = require('../lib/');
            Promise.all(test.runBatch(argv)).catch(function(err) {
                assert.ifError(err);
            }).finally(function() {
                done();
            });
        });


        after(function() {
            mockery.disable();
        });
    });

    describe('When the tests in WebPageTest is failing', function() {
        before(function() {
            mockery.registerMock('./wpt', wptFailingMock);
            mockery.enable({
                useCleanCache: true,
                warnOnReplace: false,
                warnOnUnregistered: false
            });
        });
        it('We should get an error when WPT returns an error code', function(done) {
            var argv = {
                batch: 'test/files/batch.txt'
            };
            var test = require('../lib/');
            Promise.all(test.runBatch(argv)).catch(function(err) {
                assert.ifError(!err);
            }).finally(function() {
                done();
            });

        });

        after(function() {
            mockery.disable();
        });
    });
});
