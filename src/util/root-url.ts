import {clearNonce, hasExternalNonce, restoreNonce, setNonce} from './nonce';
import type {FetchOptions} from '@wordpress/api-fetch';
import {addQueryArgs, addTrailingSlash, getQueryArg, removeLeadingSlash} from '../helpers/url';

let rootURL: string = '';
let initialRootURL: string = '';

/**
 * Set default the Root URL to use for all requests when
 * `setRootURL` has not been called, or the `url` has been reset
 * using `restoreRootURL`.
 *
 * Optional function for complex setup where automatic detection
 * is impossible or not desired.
 */
export function setInitialRootURL( url: string ): void {
	initialRootURL = url;
	rootURL = url;
}


/**
 * Restore original root URL either set by `setRootInitialURL`
 * or automatically detected from the document.
 */
export function restoreRootURL(): void {
	if ( '' === initialRootURL ) {
		rootURL = '';
		rootURL = getRootURL();
	} else {
		rootURL = initialRootURL;
	}
}


/**
 * Get the Root URL for the current site.
 *
 * If the root URL has not been set, it will attempt to
 * detect the root URL from:
 * 1. Document <link /> element (front-end).
 * 2. `wpApiSettings` any page which has `wp-api-request` enqueued. (admin)
 *
 * Fallback to the current window location of still not found.
 *
 * If not working in specific cases, use `setRootURL` to set the root URL.
 */
export function getRootURL(): string {
	if ( '' !== rootURL ) {
		return addTrailingSlash( rootURL );
	}
	const linkElement = document.querySelector( 'link[rel="https://api.w.org/"]' );
	const href = linkElement?.getAttribute( 'href' );
	if ( 'string' === typeof href ) {
		rootURL = href;
	} else if ( undefined !== window.wpApiSettings?.root ) {
		rootURL = window.wpApiSettings.root;
	} else {
		throw new URIError( 'Unable to determine the root URL. Use `setInitialRootURL` to set the root URL.' );
	}

	return addTrailingSlash( rootURL );
}


/**
 * Get the full URL for a request.
 */
export function getFullUrl<D = object>( requestOptions: FetchOptions<D>, withLocal: boolean = true ): string {
	let url = '';
	if ( 'undefined' === typeof requestOptions.url ) {
		if ( 'string' === typeof requestOptions.path ) {
			url = getRootURL();
			// Pretty permalinks are disabled.
			if ( url.indexOf( '?' ) > -1 ) {
				requestOptions.path = requestOptions.path.replace( '?', '&' );
			}
			url += removeLeadingSlash( requestOptions.path );
		} else {
			url = getRootURL();
		}
	} else {
		url = requestOptions.url;
	}
	if ( withLocal ) {
		return addLocalToRequests( url );
	}
	return url;
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

	if ( '' === window.location.hostname || new URL( rootURL ).hostname !== window.location.hostname ) {
		if ( nonce !== undefined ) {
			setNonce( nonce );
		} else if ( ! hasExternalNonce() ) {
			clearNonce();
		}
	} else {
		restoreNonce();
	}
}

/**
 * If the URL does not have a locale, add the default
 * "_locale=user" to the URL.
 */
const addLocalToRequests = ( url: string ): string => {
	if ( '' === getQueryArg( url, '_locale' ) ) {
		url = addQueryArgs( url, {_locale: 'user'} );
	}

	return url;
};
