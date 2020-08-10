import {__} from '@wordpress/i18n';
import {hasExternalNonce} from './nonce';

/**
 * Taken from @wordpress/api-fetch/src/utils/response.js and customized as needed.
 * api-fetch utils are not available via wp global, so we add it to
 * our build here.
 */

/**
 * Parses the apiFetch response.
 *
 * @param {Response} response
 * @param {boolean}  shouldParseResponse
 *
 * @return {Response} Parsed response.
 */
const parseResponse = ( response, shouldParseResponse = true ) => {
	if ( shouldParseResponse ) {
		if ( 204 === response.status ) {
			return null;
		}

		return response.json ? response.json() : Promise.reject( response );
	}

	return response;
};

const parseJsonAndNormalizeError = response => {
	const invalidJsonError = {
		code: 'invalid_json',
		message: __( 'The response is not a valid JSON response.' ),
	};

	if ( ! response || ! response.json ) {
		throw invalidJsonError;
	}

	return response.json().catch( () => {
		throw invalidJsonError;
	} );
};

/**
 * Parses the apiFetch response properly and normalize response errors.
 *
 * @param {Response} response
 * @param {boolean}  shouldParseResponse
 *
 * @return {Promise} Parsed response.
 */
export const parseResponseAndNormalizeError = (
	response,
	shouldParseResponse = true,
) => {
	return Promise.resolve(
		parseResponse( response, shouldParseResponse ),
	).catch( res => parseAndThrowError( res, shouldParseResponse ) );
};

export function parseAndThrowError( response, shouldParseResponse = true ) {
	if ( ! shouldParseResponse ) {
		throw response;
	}

	return parseJsonAndNormalizeError( response ).then( error => {
		const unknownError = {
			code: 'unknown_error',
			message: __( 'An unknown error occurred.' ),
		};

		// Prevent infinite loops when external requests fail.
		if ( 'rest_cookie_invalid_nonce' === error.code && hasExternalNonce() ) {
			error.code = 'external_rest_cookie_invalid_nonce';
		}

		throw error || unknownError;
	} );
}
