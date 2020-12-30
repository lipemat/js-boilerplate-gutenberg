import 'core-js/stable';
import 'regenerator-runtime/runtime';

require( 'unfetch/polyfill' ); // So we can use window.fetch.

// eslint-disable-next-line no-undef
jest.spyOn( global.console, 'warn' ).mockImplementation( () => jest.fn() );

/**
 * The Http-V1 middleware from apiFetch translates the method
 * into `X-HTTP-Method-Override` which breaks during jsdom requests.
 *
 * We mock it here to simply skip this middleware.
 */
// eslint-disable-next-line no-undef
jest.mock( '@wordpress/api-fetch/build/middlewares/http-v1.js', () => ( options, next ) => {
	return next( options, next );
} );

let __cookies;
Object.defineProperty( window.document, 'cookie', {
	get: () => __cookies,
	set: v => __cookies = v,
	slit: s => __cookies.split( s ),
} );

// Mock environmental variables
global.__TEST__ = true;

