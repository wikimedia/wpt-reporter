/**
 * @fileoverview Utilities file holding help methods.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const cli = require( './cli' );

module.exports = {
	/**
	 * Create a WebPageTest options object from input arguments.
	 * @param {Array} argv The arguments for the run
	 * @return {Object} the WebPageTest options object
	 */
	setupWPTOptions: function( argv ) {

		const wptOptions = {
			pollResults: 10,
			timeout: 0,
			video: 'true',
			label: argv.label ? argv.label + '-' + this.getTodaysDate() : this.getTodaysDate(),
			runs: 11
		};

		Object.keys( argv ).forEach( function( param ) {
			if ( [ 'webPageTestKey', 'webPageTestHost', '_', 'verbose',
				'customMetrics', 'namespace', 'batch', 'label', 'endpoint',
				'reporter'
			].indexOf( param ) === -1 ) {
				wptOptions[ param ] = argv[ param ];
			}
		} );

		return wptOptions;
	},
	/**
	 * Convert an input text line from a file to a minimist created argument object
	 * @param {string} line The text line
	 * @return {Object} a minimist argument object
	 */
	convertTextLineToMinimist: function( line ) {
		// replace variables with env variables
		line = this.replaceWithEnv( line );
		// the location element for WebPageTest has a couple of different
		// variants: http://www.webpagetest.org/getLocations.php
		// most problem for us is the space that sometimes is in the name
		// so for now: remove location before parse and then add it again

		let location = '';
		const locationLine = line.match( /--location(.*?)(?=\s--)/g );
		if ( locationLine ) {
			line = line.split( locationLine[ 0 ] + ' ' ).join( '' );
			location = locationLine[ 0 ].replace( '--location ', '' );
		}
		const myArgs = cli.getMinimistArgv( line.split( ' ' ) ); // eslint-disable-line one-var

        // insert the location again
		if ( locationLine ) {
			myArgs.location = location;
		}
		return myArgs;
	},
	/**
	 * Read a text file (utf-8) and retunr the content.
	 * @param {string} filename The file and path to the file to read
	 * @return {string} the text file
	 */
	readFile: function( filename ) {
		const fullPathToFile = ( filename.charAt( 0 ) === path.sep ) ? filename :
		path.join( process.cwd(), path.sep, filename );
		return fs.readFileSync( fullPathToFile, 'utf-8' );
	},
	/**
	 * Get the file content or the URL for a run. The webpagetest api takes either
	 * a URL or a file with URLs.
	 * @param {string} arg The argument to checkif it's a URL or file.
	 * @param {string} the URL or content of the file
	 * @return {string} content to test on WebPageTest
	 */
	getInputURLorFile: function( arg ) {
		// is it a file or URL we wanna test?
		if ( arg.indexOf( 'http' ) !== -1 ) {
			return arg;
		}
		const fileContent = this.readFile( arg );
		return this.replaceWithEnv( fileContent );
	},
	/**
	 * Replace all occurrences placeholders matching <%YOUR_KEY>
	 * with a matching named environment variable. Log error if we
	 * have placeholders but no matching variables.
	 * @param {string} text The text to replae
	 * @return {string} the text with replaced placeholders
	 */
	replaceWithEnv: function( text ) {
		const matches = text.match( /<(.*?)>/g );
		if ( matches ) {
			matches.forEach( function( match ) {
				// do we have a matching ENV?
				const env = match.substring( 2, match.length - 1 );
				if ( process.env[ env ] ) {
					text = text.replace( match, process.env[ env ] );
				} else {
					console.error( 'No ENV set for ' + env + ' the expr ' + match +
					' will not be replaced' );
				}

			} );
		}
		return text;
	},
	/**
	 * Get the current date and time in UTC.
	 * @return {string} the time with the format YYYY-MM-DD HH.MM
	 */
	getTodaysDate: function() {

		function addPadding( number ) {
			number = number.toString();
			if ( number.length === 1 ) {
				return '0' + number;
			}
			return number;
		}

		const date = new Date();
		const month = addPadding( date.getUTCMonth() + 1 );
		const day = addPadding( date.getUTCDate() );
		const hours = addPadding( date.getUTCHours() );
		const minutes = addPadding( date.getUTCMinutes() );

		return date.getUTCFullYear() + '-' + month + '-' + day + ' ' + hours + '.' + minutes;
	}
};
