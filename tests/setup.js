import 'core-js/stable';
import 'regenerator-runtime/runtime';

require( 'unfetch/polyfill' ); // So we can use window.fetch.

// eslint-disable-next-line no-undef
jest.spyOn( global.console, 'warn' ).mockImplementation( () => jest.fn() );
// eslint-disable-next-line no-undef
jest.spyOn( global.console, 'error' ).mockImplementation( () => jest.fn() );

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

// Mock environmental variables
global.__TEST__ = true;

