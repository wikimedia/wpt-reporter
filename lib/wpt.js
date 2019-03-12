/**
 * @fileoverview The functionallity to fetch data from WebPageTest.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';
const bluebird = require( 'bluebird' );
const WebPageTest = require( 'webpagetest' );

bluebird.promisifyAll( WebPageTest.prototype );

module.exports = {
	run: function ( host, key, argv, input, wptOptions ) {
		const wpt = new WebPageTest( host, key );
		return wpt.runTestAsync( input, wptOptions );
	}
};
