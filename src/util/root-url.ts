import apiFetch from '@wordpress/api-fetch';
import {addMiddleware, removeMiddleware} from './request-handler';

let rootURLMiddleware: number;
let clearNonceMiddleware: number;

/**
 * Set the Root URL for any following requests.
 *
 * We delete the `path` from the options to override createRootURLMiddleware
 * which always fires later in the stack.
 *
 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/#middlewares
 *
 * @param rootURL
 */
export function setRootURL( rootURL: string ): void {
	if ( rootURLMiddleware ) {
		removeMiddleware( rootURLMiddleware );
	}
	rootURLMiddleware = addMiddleware( apiFetch.createRootURLMiddleware( rootURL.replace( /\/$/, '' ) + '/' ) );

	if ( ! window.location.hostname || new URL( rootURL ).hostname !== window.location.hostname ) {
		clearNonce();
	} else {
		restoreNonce();
	}
}

/**
 * Middleware for clearing nonce values to allow external requests.
 *
 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/#middlewares
 *
 */
export function clearNonce(): void {
	if ( clearNonceMiddleware ) {
		return;
	}
	clearNonceMiddleware = addMiddleware( ( options, next ) => {
		if ( typeof options.headers !== 'undefined' ) {
			delete options.headers[ 'X-WP-Nonce' ];
			delete options.headers[ 'x-wp-nonce' ];
		}

		return next( options, next );
	} );
}

/**
 * Restore any previously set nonce by removing the middleware
 * which clears it.
 *
 */
export function restoreNonce(): void {
	removeMiddleware( clearNonceMiddleware );
	clearNonceMiddleware = 0;
}
