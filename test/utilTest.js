/*
wptstatsv
~~~~~~~
A thin wrapper for the WebPageTest API that sends metrics to statsv.

Copyright 2015 Peter Hedenskog <phedenskog@wikimedia.org>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
'use strict';

const util = require( '../lib/util' );
const assert = require( 'assert' );
const batchScript = util.readFile( 'test/files/batch.txt' );
const eol = require( 'os' ).EOL;

describe( 'Test util', function() {
	it( 'Adding a URL should return a URL', function() {
		const arg = 'https://www.wikipedia.org';
		const value = util.getInputURLorFile( arg );
		assert.deepEqual( value, arg );
	} );

	it( 'Adding a file should return a file', function() {
		const arg = 'test/files/scripting.txt';
		util.getInputURLorFile( arg );
	} );

	it( 'Location field should work with and without spaces and without a location', function() {
		const validValues = [ 'Dulles:Chrome', 'Dulles_MotoG:Motorola G - Chrome', 'Dulles:Chrome' ];
		const lines = batchScript.split( eol );

		for ( let i = 0; i < lines.length; i++ ) {
			if ( lines[ i ].indexOf( '#' ) !== 0 && lines[ i ].length > 1 ) {
				const myargs = util.convertTextLineToMinimist( lines[ i ] );
				assert.strictEqual( myargs.location, validValues[ i ] );
			}
		}

	} );

	it( 'WebPageTest options should be added', function() {

		const args = {
			location: 'ap-northeast-1_IE10',
			connectivity: '3G'
		};
		const wptOptions = util.setupWPTOptions( args );
		assert.deepEqual( wptOptions.location, 'ap-northeast-1_IE10' );
		assert.deepEqual( wptOptions.connectivity, '3G' );
	} );

	it( 'There should not be multiple spaces in the WebPageTest options', function() {
		const lines = batchScript.split( eol );
		for ( let i = 0; i < lines.length; i++ ) {
			if ( lines[ i ].indexOf( '#' ) !== 0 && lines[ i ].length > 1 ) {
            // we don't want double spaces
				assert.strictEqual( lines[ i ].indexOf( '  ' ), -1 );
				const myargs = util.convertTextLineToMinimist( lines[ i ] );
            // and make sure that the array is only having one
            // item (=url or script).
				assert.strictEqual( myargs._.length, 1 );
			}
		}
	} );

	it( 'Parameters specific for wptstatsv should be cleaned out from WebPageTest options', function() {

		const keysToBeRemoved = [ 'webPageTestKey', 'webPageTestHost', '_', 'verbose',
			'sendMetrics', 'customMetrics', 'namespace' ];
		const args = {
			webPageTestKey: 'aSupERSecrEtKey',
			webPageTestHost: 'http://www.example.org',
			_: [ 'all', 'extra', 'args' ],
			verbose: true,
			customMetrics: 'javascript that collects custom metrics',
			namespace: 'super.special.namespace'
		};
		const wptOptions = util.setupWPTOptions( args );
		keysToBeRemoved.forEach( function( key ) {
			assert.strictEqual( wptOptions[ key ], undefined );
		} );
	} );

	it( 'We should be able to replace ENV variables', function() {

		process.env.MY_URL = 'VAR1';
		process.env.MY_SECOND_URL = 'VAR2';

		const text = util.readFile( 'test/files/scriptingWithEnv.txt' );
		const replacedText = util.replaceWithEnv( text );
		assert.strictEqual( replacedText.match( /VAR1/g ).length, 2 );
		assert.strictEqual( replacedText.match( /VAR2/g ).length, 1 );
	} );

} );
