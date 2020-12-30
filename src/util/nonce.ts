import {addMiddleware, removeMiddleware} from './middleware';


let clearNonceMiddleware: number | undefined;
let setNonceMiddleware: number | undefined;

/**
 * Do we have a nonce manually set?
 */
export function hasExternalNonce(): boolean {
	return 'undefined' !== typeof setNonceMiddleware;
}

/**
 * Are all nonces currently cleared?
 */
export function isNonceCleared(): boolean {
	return 'undefined' !== typeof clearNonceMiddleware;
}

/**
 * Middleware for setting a nonce value for external requests.
 * Can be called directly or used via `setRootURL`.
 *
 * @notice WP does not support sending a nonce to an external site by default.
 *         The external site must change the following headers:
 *         1. 'Access-Control-Allow-Headers: Authorization, Content-Type, X-WP-Nonce'
 *         2. 'Access-Control-Allow-Credentials: true'
 *         These may be added via `header()` calls on the `rest_pre_serve_request` filter.
 *         3. This is not be needed with WP 5.5+ https://make.wordpress.org/core/2020/07/22/rest-api-changes-in-wordpress-5-5/
 *
 *
 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/#built-in-middlewares
 *
 * @see setRootURL
 *
 * @param {string} nonce
 */
export function setNonce( nonce: string ): void {
	restoreNonce();
	setNonceMiddleware = addMiddleware( createNonceMiddleware( nonce ) );
}

/**
 * Middleware for clearing nonce values to allow external requests.
 *
 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/#middlewares
 *
 */
export function clearNonce(): void {
	if ( 'undefined' !== typeof setNonceMiddleware ) {
		removeMiddleware( setNonceMiddleware );
		setNonceMiddleware = undefined;
	}
	if ( 'undefined' !== typeof clearNonceMiddleware ) {
		return;
	}
	clearNonceMiddleware = addMiddleware( ( options, next ) => {
		if ( typeof options.headers !== 'undefined' ) {
			for ( const headerName in options.headers ) {
				if ( 'x-wp-nonce' === headerName.toLowerCase() ) {
					delete options.headers[ headerName ];
				}
			}
		}

		return next( options, next );
	} );
}

/**
 * Restore the original nonce by removing the middleware
 * which clears it.
 *
 */
export function restoreNonce(): void {
	if ( 'undefined' !== typeof setNonceMiddleware ) {
		removeMiddleware( setNonceMiddleware );
	}
	if ( 'undefined' !== typeof clearNonceMiddleware ) {
		removeMiddleware( clearNonceMiddleware );
	}
	setNonceMiddleware = undefined;
	clearNonceMiddleware = undefined;
}

/**
 * The nonce middleware built into api-fetch will not allow
 * changing of the nonce once it is set, so we roll our own
 * which changes the header each time.
 *
 * @see apiFetch.createNonceMiddleware
 *
 * @param nonce
 */
function createNonceMiddleware( nonce ) {
	function middleware( options, next ) {
		const {headers = {}} = options;
		// Remove any existing.
		for ( const headerName in headers ) {
			if ( 'x-wp-nonce' === headerName.toLowerCase() ) {
				delete headers[ headerName ];
			}
		}

		return next( {
			...options,
			headers: {
				...headers,
				'X-WP-Nonce': middleware.nonce,
			},
		} );
	}

	middleware.nonce = nonce;

	return middleware;
}
