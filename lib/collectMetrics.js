/**
 * @fileoverview Collect the metrics from the WebPageTest JSON.
 * @author Peter Hedenskog
 * @copyright (c) 2015, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';

const cpuTime = require( './cpuTime' );

module.exports = {
	/**
	 * Collect the metrics we want from the giant WebPageTest JSON. We always
	 * collect values from the median run.
	 * @param {Object} wptJson The JSON returned from the WebPageTest API
	 * @param {Array} argv The input parameters for the run.
	 * @return {Object} Collected metrics
	 */
	collect: function ( wptJson, argv ) {
		const metricsToSend = {
			timings: {},
			requests: {},
			sizes: {},
			misc: {},
			cpuTimes: {}
		};
		const namespace = argv.namespace;
		const emulateMobile = argv.emulateMobile;
		const firstViewOnly = argv.first;
		const metricsToCollect = argv.metrics.split( ',' );
		const views = [ 'firstView' ];

		if ( !firstViewOnly ) {
			views.push( 'repeatView' );
		}

		views.forEach( function ( view ) {
			if ( wptJson.data.median[ view ] ) {
				// if we are missing browser info from WPT (happens when using MotoG at least)
				// use a normalized version of the location
				// the browser/location can then look like Dulles_MotoG_Motorola_G_Chrome
				// but since there are no standard of naming it should be ok to just use what we got
				let browser = wptJson.data.median[ view ].browser_name ?
					wptJson.data.median[ view ].browser_name.replace( / /g, '_' ) :
					wptJson.data.location.replace( /[^A-Za-z_0-9]/g, '_' ).replace( /__+/g, '_' );

				if ( emulateMobile ) {
					browser += '-emulateMobile';
				}

				// the actual location is the first part of the location string
				// separated by either a : or _
				const location = wptJson.data.location.split( /:|_/ )[ 0 ];
				const keyStart = namespace + '.' + location + '.' + browser + '.' + view + '.';

				metricsToCollect.forEach( function ( metric ) {
					// We don't have all metrics for all browsers, for example LastInteractive
					if ( wptJson.data.median[ view ][ metric ] ) {
						metricsToSend.timings[ keyStart + metric ] = wptJson.data.median[ view ][ metric ];
					}
					// For all timing metrics we also collect standard deviation
					if (
						wptJson.data.standardDeviation[ view ][ metric ] === 0 ||
						wptJson.data.standardDeviation[ view ][ metric ]
					) {
						metricsToSend.timings[ keyStart + metric + 'Sdev' ] =
						wptJson.data.standardDeviation[ view ][ metric ];
					}
				} );

				metricsToSend.misc[ keyStart + 'domElements' ] =
				wptJson.data.median[ view ].domElements;

				// you need to turn on timeline collecting and use Chrome for this to work
				if ( argv.timeline ) {
					if ( wptJson.data.median[ view ].cpuTimes ) {
						const cpuTimes = cpuTime.sum( wptJson.data.median[ view ].cpuTimes );
						Object.keys( cpuTimes ).forEach( function ( time ) {
							metricsToSend.cpuTimes[ keyStart + 'cpuTimes.' + time ] =
							cpuTimes[ time ];
						} );
					}
					if ( wptJson.data.median[ view ].cpuTimesDoc ) {
						const cpuTimesDoc = cpuTime.sum( wptJson.data.median[ view ].cpuTimesDoc );
						Object.keys( cpuTimesDoc ).forEach( function ( cpuTimeDoc ) {
							metricsToSend.cpuTimes[ keyStart + 'cpuTimesDoc.' + cpuTimeDoc ] =
							cpuTimesDoc[ cpuTimeDoc ];
						} );
					}
				}

				if ( wptJson.data.median[ view ].userTimes ) {
					Object.keys( wptJson.data.median[ view ].userTimes ).forEach( function ( userTiming ) {
						metricsToSend.timings[ keyStart + userTiming ] =
						wptJson.data.median[ view ].userTimes[ userTiming ];
					} );
				} else {
					console.error( 'Missing user timing metrics for view ' + view );
				}

				// We have special handling for Visual Elements since we want to
				// rename them from HERO to just elements.
				const elements = wptJson.data.median[ view ].heroElementTimes;
				if ( elements ) {
					if ( elements.Image ) {
						metricsToSend.timings[ keyStart + 'LargestImage' ] = elements.Image;
					}
					if ( elements.BackgroundImage ) {
						metricsToSend.timings[ keyStart + 'BackgroundImage' ] = elements.BackgroundImage;
					}
					if ( elements.Heading ) {
						metricsToSend.timings[ keyStart + 'Heading' ] = elements.Image;
					}
				}

				// collect sizes & assets
				Object.keys( wptJson.data.median[ view ].breakdown ).forEach( function ( assetType ) {
					metricsToSend.requests[ keyStart +
						assetType + '.requests' ] = wptJson.data.median[ view ].breakdown[ assetType ]
						.requests;
					metricsToSend.sizes[ keyStart +
						assetType + '.bytes' ] =
						wptJson.data.median[ view ].breakdown[ assetType ].bytes;

					// Collect the total size, we need it for Opera Mini and UC Mini where the size
					// is not reported per type
					metricsToSend.sizes[ keyStart + 'total.bytes' ] =
					wptJson.data.median[ view ].bytesIn;

				} );
			} else {
				// When we get a result error 99998 from WebPageTest, the repeat view is left out
				// so then skip the data and log
				console.error( 'Missing view ' + view );
			}
		} );
		return metricsToSend;
	}
};
