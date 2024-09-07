import {clearNonce, hasExternalNonce, restoreNonce, setNonce} from './nonce';
import type {FetchOptions} from '@wordpress/api-fetch';
import {addQueryArgs, getQueryArg} from '../helpers/url';

let rootURL: string = '';

export function getRootURL(): string {
	if ( '' === rootURL ) {
		return window.location.origin + '/wp-json/';
	}

	return rootURL.replace( /\/$/, '' ) + '/';
}

export function getFullUrl<D = {}>( requestOptions: FetchOptions<D>, withLocal: boolean = true ): string {
	let url = '';
	if ( 'undefined' === typeof requestOptions.url ) {
		if ( 'string' === typeof requestOptions.path ) {
			url = getRootURL() + requestOptions.path.replace( /^\//, '' );
		} else {
			url = getRootURL();
		}
	} else {
		url = requestOptions.url;
	}
	if ( withLocal ) {
		return userLocaleMiddleware( url );
	}
	return url;
}


/**
 * Restore original root URL set by WordPress.
 *
 * @since 1.3.0
 */
export function restoreRootURL(): void {
	rootURL = '';
}

/**
 * Set the Root URL for any following requests.
 *
 * We delete the `path` from the options to override createRootURLMiddleware,
 * which always fires later in the stack.
 *
 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/#middlewares
 *
 * @param {string} url   - URL of the endpoint.
 * @param {nonce}  nonce - Optionally provide a nonce for the external site.
 *                       This may be set prior or after via `setNonce`.
 *                       If previously set, and not provided here, the existing
 *                       nonce will be used.
 *
 * @notice To use update calls, which send PUT requests an additional 'X-HTTP-Method-Override'
 *         header must be allowed via CORS.
 *         Use the `rest_allowed_cors_headers` filter. (WP 5.5+)
 *
 * @see setNonce
 *
 * @example setRootUrl('https://my-wordpress-site/wp-json/', 'fh32efsES');
 */
export function setRootURL( url: string, nonce?: string ): void {
	rootURL = url.replace( /\/$/, '' ) + '/';

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

const userLocaleMiddleware = ( url: string ): string => {
	if ( '' === getQueryArg( url, '_locale' ) ) {
		url = addQueryArgs( url, {_locale: 'user'} );
	}

	return url;
};
