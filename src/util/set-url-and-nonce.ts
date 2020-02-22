import apiFetch from '@wordpress/api-fetch';
import {parseUrl} from './parse-url';

/**
 * Middleware may only be used once they are called in order
 * and new ones are added to the beginning of the list.
 * WP core calls both the nonce and root URL middleware when
 * `wp-api-fetch` in enqueued.
 *
 * There is currently no way to change those values within a WP
 * install.
 *
 * If not running on WP, the methods in the file are required
 * to both set these values and work to change them.
 *
 * These methods are also very useful for unit testing.
 *
 */

let currentURL;
let currentNonce;

/**
 * Set the Root URL when not within a WP install.
 *
 * @param URL
 */
export function setRootURL( URL: string ) {
	currentURL = URL;
}

export function setCurrentNonce( nonce: string ) {
	currentNonce = nonce;
}

apiFetch.use( ( options, next ) => {
	if ( undefined === currentURL ) {
		console.log( 'You must set a root URL via `@lipemat/js-boilerplate-gutenberg{setRootURL}`' );
		return next( options );
	}
	return next( {
		...options,
		url: parseUrl( currentURL, options.path ),
	} );
} );


apiFetch.use( ( options, next ) => {
	if ( undefined === currentNonce ) {
		return next( options );
	}
	return apiFetch.createNonceMiddleware( currentNonce )( options, next );
} );
