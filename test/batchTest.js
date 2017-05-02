const underTest = require('../lib/');
const mockery = require('mockery');
const assert = require('assert');
const util = require('../lib/util');
const Promise = require('bluebird');
const desktopJson = JSON.parse(util.readFile('test/files/desktop_result.json'));

const wptMock = {
    run: function(host, key, argv, input, wptOptions) {
        return new Promise(function(resolve) {
          resolve(desktopJson);
      });
    }
};

const wptFailingMock = {
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
            const argv = {
                batch: 'test/files/batch.txt'
            };
            const test = require('../lib/');
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
            const argv = {
                batch: 'test/files/batch.txt'
            };
            const test = require('../lib/');
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
