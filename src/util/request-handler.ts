import {parseAndThrowError, parseResponseAndNormalizeError} from './parse-response';
import {__} from '@wordpress/i18n';
import type {FetchOptions, Middleware} from '@wordpress/api-fetch';
import {getAllMiddleware} from './middleware';

/**
 * Taken from @wordpress/api-fetch/src/index.js
 * `defaultFetchHandler` is not available via exports, so we add it here.
 *
 * Middleware may only be used once as they are called in order
 * and new ones are added to the beginning of the list.
 * Therefore, we can't change arguments sent to `window.fetch` right before
 * it's sent and WP Core's middleware will always override ours.
 *
 * That is why this file exists to allow changing the arguments right
 * before sending, after WP Core does theirs.
 *
 * Calling `wpapi` automatically switches the request handler to our.
 */


/**
 * Default set of header values, which should be sent with every request unless
 * explicitly provided through apiFetch options.
 *
 * @type {Object}
 */
const DEFAULT_HEADERS = {
	// The backend uses the Accept header as a condition for considering an
	// incoming request as a REST request.
	//
	// See: https://core.trac.wordpress.org/ticket/44534
	Accept: 'application/json, */*;q=0.1',
};

/**
 * Default set of fetch option values, which should be sent with every request
 * unless explicitly provided through apiFetch options.
 *
 * @type {Object}
 */
const DEFAULT_OPTIONS = {
	credentials: 'include',
};

const checkStatus = response => {
	if ( response.status >= 200 && response.status < 300 ) {
		return response;
	}

	throw response;
};

/**
 * @see apiFetch()
 * @param  index
 * @param  steps
 */
export const createRunStep = ( index: number, steps: Middleware<any>[] ) => ( workingOptions: FetchOptions<any> ): FetchOptions<any> => {
	if ( 'undefined' === typeof steps[ index ] ) {
		return workingOptions;
	}
	const step = steps[ index ];
	if ( index === steps.length - 1 ) {
		return step( workingOptions, options => options );
	}

	const next = createRunStep( index + 1, steps );
	return step( workingOptions, next );
};


export const defaultFetchHandler = nextOptions => {
	const options = createRunStep( 0, getAllMiddleware().filter( Boolean ) )( {
		...DEFAULT_OPTIONS,
		...nextOptions,
	} );

	const {url, path, data, parse = true, ...remainingOptions} = options;
	let {body, headers} = options;

	// Merge explicitly-provided headers with default values.
	headers = {...DEFAULT_HEADERS, ...headers};

	// The `data` property is a shorthand for sending a JSON body.
	if ( data ) {
		body = JSON.stringify( data );
		headers[ 'Content-Type' ] = 'application/json';
	}

	const responsePromise = window.fetch( url || path || '', {
		...remainingOptions,
		body,
		headers,
	} );

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
						.then( response =>
							parseResponseAndNormalizeError( response, parse ),
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
