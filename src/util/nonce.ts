import {addMiddleware, removeMiddleware} from './request-handler';
import apiFetch from '@wordpress/api-fetch';


let clearNonceMiddleware: number;
let setNonceMiddleware: number;

/**
 * Do have a nonce manually set?
 *
 */
export function hasExternalNonce() : boolean {
	return !! clearNonceMiddleware;
}

/**
 * Middleware for setting a nonce value for external requests.
 * Can be called directly or used via `setRootURL`
 *
 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/#built-in-middlewares
 *
 * @see setRootURL
 *
 * @param {string} nonce
 */
export function setNonce( nonce: string ): void {
	if ( setNonceMiddleware ) {
		removeMiddleware( setNonceMiddleware );
	}
	setNonceMiddleware = addMiddleware( apiFetch.createNonceMiddleware( nonce ) );

	restoreNonce();
}

/**
 * Middleware for clearing nonce values to allow external requests.
 *
 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/#middlewares
 *
 */
export function clearNonce(): void {
	if ( setNonceMiddleware ) {
		removeMiddleware( setNonceMiddleware );
	}
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
	if ( clearNonceMiddleware ) {
		removeMiddleware( clearNonceMiddleware );
	}
	clearNonceMiddleware = 0;
}
