import {parseAndThrowError, parseResponseAndNormalizeError} from './parse-response';
import {__} from '@wordpress/i18n';
import type {FetchOptions} from '@wordpress/api-fetch';
import {getFullUrl} from './root-url';
import {getNonce, refreshNonce} from './nonce';
import {getApplicationPassword} from './authorize';

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
export const fetchHandler = <T, D = {}>( requestOptions: FetchOptions<D> ): Promise<T> => {
	const options: RequestInit = requestOptions;
	const {url, path, data, parse = true, ...remainingOptions} = requestOptions;

	let {body} = options;

	// Merge explicitly-provided headers with default values.
	const headers: HeadersInit = {
		...DEFAULT_HEADERS,
		...( getNonce() !== '' ? {'X-WP-Nonce': getNonce()} : {} ),
		...( getApplicationPassword() !== '' ? {Authorization: getApplicationPassword()} : {} ),
		...options.headers,
	};

	// The `data` property is a shorthand for sending a JSON body.
	if ( data ) {
		body = JSON.stringify( data );
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
						.then( ( response: Response ) =>
							parseResponseAndNormalizeError<T>( response, parse ),
						)
						.catch( response => refreshNonce<T, D>( response, requestOptions )
						),
				err => {
					// Re-throw AbortError for the users to handle it themselves.
					if ( err && 'AbortError' === err.name ) {
						throw err;
					}

					throw {
						code: 'fetch_error',
						message: __( 'You are probably offline.' ),
					};
				},
			)
	);
};
