/**
 * @fileoverview Summarize detvtools timeline metrics provided by WPT.
 * @author Peter Hedenskog
 * @copyright (c) 2016, Peter Hedenskog <peter@wikimedia.org>.
 * Released under the Apache 2.0 License.
 */

'use strict';

// The list comes from WebPageTest and is slightly modified for one missing event
// https://github.com/WPO-Foundation/webpagetest/blob/4c64acadc5b1625d5b7526d39452d4c2b97679e6/www/breakdownTimeline.php

const mapTimings = {
	EvaluateScript: 'Scripting',
	'v8.compile': 'Scripting',
	FunctionCall: 'Scripting',
	GCEvent: 'Scripting',
	TimerFire: 'Scripting',
	EventDispatch: 'Scripting',
	TimerInstall: 'Scripting',
	TimerRemove: 'Scripting',
	XHRLoad: 'Scripting',
	XHRReadyStateChange: 'Scripting',
	MinorGC: 'Scripting',
	MajorGC: 'Scripting',
	BlinkGCMarking: 'Scripting',
	FireAnimationFrame: 'Scripting',
	'ThreadState::completeSweep': 'Scripting',
	'Heap::collectGarbage': 'Scripting',
	'ThreadState::performIdleLazySweep': 'Scripting',
	Layout: 'Layout',
	UpdateLayoutTree: 'Layout',
	RecalculateStyles: 'Layout',
	ParseAuthorStyleSheet: 'Layout',
	ScheduleStyleRecalculation: 'Layout',
	InvalidateLayout: 'Layout',
	Paint: 'Painting',
	DecodeImage: 'Painting',
	'Decode Image': 'Painting',
	ResizeImage: 'Painting',
	CompositeLayers: 'Painting',
	Rasterize: 'Painting',
	PaintImage: 'Painting',
	PaintSetup: 'Painting',
	ImageDecodeTask: 'Painting',
	GPUTask: 'Painting',
	SetLayerTreeId: 'Painting',
	layerId: 'Painting',
	UpdateLayer: 'Painting',
	UpdateLayerTree: 'Painting',
	'Draw LazyPixelRef': 'Painting',
	'Decode LazyPixelRef': 'Painting',
	ParseHTML: 'Loading',
	ResourceReceivedData: 'Loading',
	ResourceReceiveResponse: 'Loading',
	ResourceSendRequest: 'Loading',
	ResourceFinish: 'Loading',
	CommitLoad: 'Loading',
	Idle: 'Idle'
};

module.exports = {
	sum: function( times ) {
		const total = {};
		Object.keys( times ).forEach( function( name ) {
			if ( mapTimings[ name ] === undefined ) {
				// We have a un-mapped entry in devtools timeline metrics:
				return;
			} else if ( total[ mapTimings[ name ] ] ) {
				total[ mapTimings[ name ] ] += times[ name ];
			} else {
				total[ mapTimings[ name ] ] = times[ name ];
			}
		} );
		return total;
	}
};
