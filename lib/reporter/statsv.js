/**
 * @fileoverview Report the metrics to statsv.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';
const request = require( 'request' );
const STATSV_MAX_LENGTH = 2000;

function sendMetrics( url, endpoint ) {
	request( url, function( error, response, body ) { // jshint unused:false
		if ( !error ) {
			console.log( 'Succesfully sent metrics.' );
		} else {
			// default testing to localhost, then skip error logging
			if ( endpoint.indexOf( 'http://localhost' ) === -1 ) {
				console.error( error );
			}
		}
	} );
}

module.exports = {
	/**
	 * Validate the input arguments.
	 * @param {Array} argv The input parameters for the run.
	 * @return {boolean} returns true if the argumenst are ok.
	 */
	validate: function( argv ) {
		return true;
	},
	/**
	 * Log help arguments to the console.
	 */
	help: function() {
		console.log( '   --endpoint           Where to send the statsv metrics ' +
		'[http://localhost]' );
	},
	/**
	 * Report the metrics by sending them to statsv.
	 * @param {Object} metrics The metrics collected from the run.
	 * @param {Array} argv The input parameters for the run.
	 */
	report: function( metrics, argv ) {
		const endpoint = argv.endpoint || 'http://localhost';
		const flatten = {};
			// flatten the structure
		Object.keys( metrics ).forEach( function( type ) {
			Object.keys( metrics[ type ] ).forEach( function( metric ) {
				flatten[ metric ] = metrics[ type ][ metric ] +
				( ( type === 'timings' || type === 'cpuTimes' ) ? 'ms' : 'g' );
			} );
		} );

		let url = endpoint + '?';
		let newUrl;
		const keys = Object.keys( flatten ); // eslint-disable-line one-var
		for ( let i = 0; i < keys.length; i++ ) {
			newUrl = url + keys[ i ] + '=' + flatten[ keys[ i ] ] + '&';
			// If the new length is larger that the limit, send what we have
			if ( newUrl.length >= STATSV_MAX_LENGTH ) {
				url = url.slice( 0, -1 );
				sendMetrics( url, endpoint );
				// Reset base url and add the new one
				url = endpoint + '?' + keys[ i ] + '=' + flatten[ keys[ i ] ] + '&';
			} else {
				url = newUrl;
			}
		}
		// send the last batch of metrics
		url = url.slice( 0, -1 );
		sendMetrics( url, endpoint );
	}
};
