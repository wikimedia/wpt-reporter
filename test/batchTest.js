var underTest = require('../lib/');
var mockery = require('mockery');
var util = require('../lib/util');
var desktopJson = JSON.parse(util.readFile('test/files/desktop_result.json'));

var wptMock = {
    run: function(host, key, argv, input, wptOptions, cb) {
        cb(null,desktopJson);
    }
};

//
mockery.registerAllowable(underTest);
mockery.registerMock('./wpt', wptMock);

describe('Test the batch functionality', function() {
    before(function() {
        mockery.enable({
            useCleanCache: true,
            warnOnReplace: false,
            warnOnUnregistered: false
        });
    });
    it('A batch file should run through cleanly', function() {
        var argv = {
            batch: 'test/files/batch.txt'
        };
        var test = require('../lib/');
        test.runBatch(argv, function() {});

    });

    after(function() {
        mockery.disable();
    });
});
