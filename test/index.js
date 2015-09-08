'use strict';

// Run jshint as part of normal testing
require('mocha-jshint')({
    paths: [
        './lib'
    ]
});
// Run jscs as part of normal testing
require('mocha-jscs')(['./lib']);
