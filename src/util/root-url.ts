import apiFetch from '@wordpress/api-fetch';
import {addMiddleware, removeMiddleware} from './middleware';
import {clearNonce, hasExternalNonce, restoreNonce, setNonce} from './nonce';

let rootURLMiddleware: number;

/**
 * Restore original root URL set by WordPress.
 *
 * @since 1.3.0
 */
export function restoreRootURL(): void {
	removeMiddleware( rootURLMiddleware );
}

/**
 * Set the Root URL for any following requests.
 *
 * We delete the `path` from the options to override createRootURLMiddleware
 * which always fires later in the stack.
 *
 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/#middlewares
 *
 * @param {string} rootURL - URL of the endpoint.
 * @param {nonce} nonce - Optionally provide a nonce for the external site.
 *                        This may be set prior or after via `setNonce`.
 *                        If previously set, and not provided here, the existing
 *                        nonce will be used.
 *
 * @notice To use update calls which send PUT requests an additional 'X-HTTP-Method-Override'
 *         header must be allowed via CORS.
 *         Use the `rest_allowed_cors_headers` filter. (WP 5.5+)
 *
 * @see setNonce
 *
 * @example setRootUrl( 'http://my-wordpress-site/wp-json/', 'fh32efsES' );
 */
export function setRootURL( rootURL: string, nonce?: string ): void {
	if ( rootURLMiddleware ) {
		removeMiddleware( rootURLMiddleware );
	}
	rootURLMiddleware = addMiddleware( apiFetch.createRootURLMiddleware( rootURL.replace( /\/$/, '' ) + '/' ) );

	if ( ! window.location.hostname || new URL( rootURL ).hostname !== window.location.hostname ) {
		if ( nonce !== undefined ) {
			setNonce( nonce );
		} else if ( ! hasExternalNonce() ) {
			clearNonce();
		}
	} else {
		restoreNonce();
	}
}

