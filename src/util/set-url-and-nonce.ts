import apiFetch, {NonceMiddleware} from '@wordpress/api-fetch';
import {parseUrl} from './parse-url';

/**
 * Middleware may only be used once they are called in order
 * and new ones are added to the beginning of the list.
 * WP core calls both the nonce and root URL middleware when
 * `wp-api-fetch` in enqueued.

 *
 * If not running on WP, the methods in this file are required
 * to both set these values and work to change them.
 * They may also be used to change them within a WP install.
 *
 * These methods are also very useful for unit testing.
 */

let currentURL: string;
let currentNonce: NonceMiddleware;

/**
 * Set the Root URL for any following requests.
 *
 * We delete the `path` from the options to override createRootURLMiddleware
 * which always fires later in the stack.
 *
 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/#middlewares
 *
 * @param URL
 */
export function setRootURL( URL: string ): void {
	if ( undefined === currentURL ) {
		apiFetch.use<{p: true}>( ( options, next ) => {
			options.url = parseUrl( currentURL, options.path );
			delete options.path; // To override the default createRootURLMiddleware.
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
