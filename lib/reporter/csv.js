/**
 * @fileoverview Report the metrics as CSV.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';

const fs = require( 'fs' );
const eol = require( 'os' ).EOL;

module.exports = {
	/**
	 * Validate the input arguments.
	 * @param {Array} argv The input parameters for the run.
	 * @return {boolean} returns true if the argumenst are ok.
	 */
	validate: function ( argv ) {
		return true;
	},
	/**
	 * Log help arguments to the console.
	 */
	help: function () {
		console.log( '   --file               The file and path to the file to write the data. ' +
		'If the file exists, the data will be appended' );
	},
	/**
	 * Report the metrics by writing them as a CSV row.
	 * @param {Object} collectedMetrics The metrics collected from the run.
	 * @param {Array} argv The input parameters for the run.
	 */
	report: function ( collectedMetrics, argv ) {
		let keys = 'url,location,connectivity,';
		let values = argv._[ 0 ] + ',' + argv.location + ',' +
			argv.connectivity + ',';
		Object.keys( collectedMetrics ).forEach( function ( type ) {
			Object.keys( collectedMetrics[ type ] ).forEach( function ( metric ) {
				// only use the last parts of the key that mean something
				const re = /firstView|repeatView/;
				const sliced = metric.split( re );
				// add the view, the metric and if we have unit (bytes/requests)
				// add that too
				keys += ( metric.indexOf( 'firstView' ) > -1 ? 'firstView' : 'repeatView' ) +
				sliced[ 1 ] + ( sliced[ 2 ] ? sliced[ 2 ] : '' ) + ',';
				values += collectedMetrics[ type ][ metric ] + ',';
			} );
		} );
		keys = keys.slice( 0, -1 );
		values = values.slice( 0, -1 );

		if ( argv.file ) {
			try {
				fs.statSync( argv.file );
				fs.appendFileSync( argv.file, values + eol, 'utf8' );
			} catch ( error ) {
				// it's new file, lets add the keys as a header
				fs.appendFileSync( argv.file, keys + eol + values + eol, 'utf8' );
			}
			console.log( 'Wrote metrics to ' + argv.file );
		} else {
			console.log( keys + eol + values );
		}
	}
};
