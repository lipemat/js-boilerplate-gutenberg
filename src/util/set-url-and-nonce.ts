import apiFetch, {NonceMiddleware} from '@wordpress/api-fetch';
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
 * If not running on WP, the methods in this file are required
 * to both set these values and work to change them.
 *
 * These methods are also very useful for unit testing.
 *
 */

let currentURL: string;
let currentNonce: NonceMiddleware;

/**
 * Set the Root URL when not within a WP install.
 *
 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/#middlewares
 *
 * @param URL
 */
export function setRootURL( URL: string ): void {
	if ( undefined === currentURL ) {
		apiFetch.use<{p: true}>( ( options, next ) => {
			options.url = parseUrl( currentURL, options.path );
			return next( options, next );
		} );
	}
	currentURL = URL;
}

/**
 * Middleware for handling dynamic nonce values.
 *
 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/#middlewares
 *
 * @param {string} nonce
 * @param {string} refreshURL - Optional URL that will automatically check for a refreshed nonce if the
 *                              value is expired.
 *                              Should be set to `admin_url( 'admin-ajax.php?action=rest-nonce' )`
 */
export function setNonce( nonce: string, refreshURL?: string ): void {
	if ( undefined === currentNonce ) {
		currentNonce = apiFetch.createNonceMiddleware<any>( nonce );
		if ( undefined !== refreshURL ) {
			apiFetch.nonceEndpoint = refreshURL;
		}
		apiFetch.use( currentNonce );
	}

	currentNonce.nonce = nonce;
}
