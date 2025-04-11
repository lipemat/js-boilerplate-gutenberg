import {type ErrorResponse, parseAndThrowError, parseResponseAndNormalizeError} from './parse-response';
import type {FetchOptions} from '@wordpress/api-fetch';
import {getFullUrl} from './root-url';
import {clearNonce, getNonce, setNonce} from './nonce';
import {type AuthenticationFailure, type AuthenticationRestRoute, type AuthorizationParams, getApplicationPassword} from './authorize';
import {addQueryArgs} from '@wordpress/url';

/**
 * Similar @wordpress/api-fetch/src/index.js
 * `defaultFetchHandler` expect we don't use middleware nor all the
 * dependencies required by the original function.
 */


/**
 * Default set of header values, which should be sent with every request unless
 * explicitly provided through apiFetch options.
 *
 */
const DEFAULT_HEADERS: HeadersInit = {
	// The backend uses the Accept header as a condition for considering an
	// incoming request as a REST request.
	//
	// See: https://core.trac.wordpress.org/ticket/44534
	Accept: 'application/json, */*;q=0.1',
};

/**
 * Default set of fetch option values, which should be sent with every request
 * unless explicitly provided through apiFetch options.
 */
const DEFAULT_OPTIONS: RequestInit = {
	credentials: 'include',
};

let refreshingNonce: boolean = false;


export const checkStatus = ( response: Response ) => {
	if ( response.status >= 200 && response.status < 300 ) {
		return response;
	}

	throw response;
};


/**
 * Similar to apiFetch but without middle ware.
 *
 */
export const fetchHandler = <T, D = object>( requestOptions: FetchOptions<D> ): Promise<T> => {
	const options: RequestInit = requestOptions;
	const {data, parse = true, ...remainingOptions} = requestOptions;
	delete remainingOptions.url;
	delete remainingOptions.path;

	let {body} = options;

	// Merge explicitly-provided headers with default values.
	const headers: HeadersInit = {
		...DEFAULT_HEADERS,
		...( getNonce() !== '' ? {'X-WP-Nonce': getNonce()} : {} ),
		...( getApplicationPassword() !== '' ? {Authorization: getApplicationPassword()} : {} ),
		...options.headers,
	};

	// The `data` property is a shorthand for sending a JSON body.
	if ( typeof data !== 'undefined' ) {
		body = JSON.stringify( data );
		// @ts-ignore -- Can't make HeaderInit more specific.
		headers[ 'Content-Type' ] = 'application/json';
	}


	const requestConfig: RequestInit = {
		...DEFAULT_OPTIONS,
		...remainingOptions,
		body,
		headers,
	};

	const responsePromise = window.fetch( getFullUrl( requestOptions ), requestConfig );

	return (
		responsePromise
			// Return early if fetch errors. If fetch error, there is most likely no
			// network connection. Unfortunately fetch just throws a TypeError, and
			// the message might depend on the browser.
			.then(
				value =>
					Promise.resolve( value )
						.then( checkStatus )
						.catch( response =>
							parseAndThrowError( response, parse ),
						)
						// @ts-ignore -- Catch clause must be any or unknown.
						.then( ( response: Response ) =>
							parseResponseAndNormalizeError<T>( response, parse ),
						)
						.catch( response => maybeRefreshNonce<T>( response, () => fetchHandler<T, D>( requestOptions ) )
						),
				( err: Error | null ) => {
					// Re-throw AbortError for the users to handle it themselves.
					if ( err && 'AbortError' === err.name ) {
						throw err;
					}

					throw {
						code: 'fetch_error',
						message: 'You are probably offline.',
					};
				},
			)
	);
};

/**
 * Retrieve the URL to the application password endpoint on the current site.
 *
 * Used to redirect your user to a WP site which they have an account on, then
 * the WP site redirects the user back to your app with the application password
 * included.
 *
 * @link https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/
 * @link http://starting-point.loc/wp-admin/authorize-application.php
 *
 * @param {AuthorizationParams} data
 */
export async function getAuthorizationUrl( data: AuthorizationParams ): Promise<string | AuthenticationFailure> {
	try {
		const response = await fetchHandler<AuthenticationRestRoute>( {
			path: '/',
			method: 'GET',
		} );

		if ( ! response.authentication[ 'application-passwords' ] ) {
			return {
				code: 'application_passwords_disabled',
				message: 'Application passwords are not enabled on this site.',
				data: null,
			};
		}
		return addQueryArgs( response.authentication[ 'application-passwords' ].endpoints.authorization, data );
	} catch ( error ) {
		return error as string;
	}
}

/**
 * Refresh the nonce if the request failed because the nonce has expired.
 * Request will fail if the user is not logged in.
 *
 * Similar to the `apiFetch` function in the `@wordpress/api-fetch` package.
 *
 * @see @wordpress/api-fetch.apiFetch
 */
export function maybeRefreshNonce<T>( error: ErrorResponse, onComplete: () => Promise<T> ): Promise<T> {
	if ( error.code !== 'rest_cookie_invalid_nonce' ) {
		return Promise.reject( error );
	}
	clearNonce();
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
				return onComplete();
			} )
			.finally( () => {
				refreshingNonce = false;
			} )
	);
}
