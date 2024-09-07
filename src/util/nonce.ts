import {getFullUrl} from './root-url';
import {checkStatus, fetchHandler} from './request-handler';
import type {FetchOptions} from '@wordpress/api-fetch';
import type {ErrorResponse} from './parse-response';

let currentNonce: string = '';
let initialNonce: string = '';
let refreshingNonce: boolean = false;


/**
 * Set the initial nonce to be used as the default for any
 * requests before setting a new nonce or clearing it.
 */
export function setInitialNonce( nonce: string | undefined ): void {
	if ( '' === initialNonce && undefined !== nonce ) {
		currentNonce = nonce;
		initialNonce = nonce;
	}
}

export function getNonce(): string {
	return currentNonce;
}

/**
 * Do we have a nonce manually set?
 */
export function hasExternalNonce(): boolean {
	return currentNonce !== '' && ( initialNonce !== '' && currentNonce !== initialNonce );
}

/**
 * Are all nonce currently cleared?
 */
export function isNonceCleared(): boolean {
	return '' === currentNonce;
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
	currentNonce = nonce;
}

/**
 * Middleware for clearing nonce values to allow external requests.
 *
 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/#middlewares
 *
 */
export function clearNonce(): void {
	currentNonce = '';
}

/**
 * Restore the original nonce by removing the middleware
 * which clears it.
 *
 */
export function restoreNonce(): void {
	currentNonce = initialNonce;
}


/**
 * Refresh the nonce if the request failed because the nonce has expired.
 *
 * Similar to the `apiFetch` function in the `@wordpress/api-fetch` package.
 *
 * See @wordpress/api-fetch.apiFetch
 */
export function refreshNonce<T, D = {}>( error: ErrorResponse, requestOptions: FetchOptions<D> ): Promise<T> {
	if ( error.code !== 'rest_cookie_invalid_nonce' ) {
		return Promise.reject( error );
	}
	if ( '' !== initialNonce ) {
		currentNonce = initialNonce;
	}
	if ( refreshingNonce ) {
		return Promise.reject( error );
	}
	refreshingNonce = true;

	return (
		window.fetch( getFullUrl( {path: 'wp-admin/admin-ajax.php?action=rest-nonce'}, false ) )
			.then( checkStatus )
			.then( data => data.text() )
			.then( text => {
				setNonce( text );
				return fetchHandler<T, D>( requestOptions );
			} )
			.finally( () => {
				refreshingNonce = false;
			} )
	);
}
