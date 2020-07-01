import {addMiddleware, removeMiddleware} from './request-handler';


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
 * Can be called directly or used via `setRootURL`.
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
	setNonceMiddleware = addMiddleware( createNonceMiddleware( nonce ) );

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
