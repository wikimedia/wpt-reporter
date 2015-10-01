var reporter = require('../lib/reporter');
var assert = require('assert');

describe('Test reporter modules', function() {

    it('All reporter modules should have the necessary methods', function() {

        Object.keys(reporter.getReporters()).forEach(function(name) {
            var mod = reporter.get(name);
            assert.strictEqual(typeof mod.validate === 'function', true,
            'The reporter ' + name + ' is missing validate');
            assert.strictEqual(typeof mod.help === 'function', true,
            'The reporter ' + name + ' is missing verify');
            assert.strictEqual(typeof mod.report === 'function',  true,
            'The reporter ' + name + ' is missing report');
        });
    });
});
