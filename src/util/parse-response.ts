import {__} from '@wordpress/i18n';
import {hasExternalNonce} from './nonce';

/**
 * Similar to @wordpress/api-fetch/src/utils/response.js.
 */

/**
 * WP REST API error response.
 *
 * @see \rest_convert_error_to_response
 */
export type ErrorResponse = {
	code: string;
	message: string;
	data?: any;
};

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

const parseJsonAndNormalizeError = async ( response: Response ) => {
	const invalidJsonError = {
		code: 'invalid_json',
		message: __( 'The response is not a valid JSON response.' ),
	};

	if ( ! response || ! response.json ) {
		throw invalidJsonError;
	}

	try {
		return await response.json();
	} catch {
		throw invalidJsonError;
	}
};


export const parseResponseAndNormalizeError = async <T>( response: Response, shouldParseResponse: boolean = true ): Promise<T> => {
	try {
		return await Promise.resolve(
			parseResponse( response, shouldParseResponse ) );
	} catch ( res ) {
		return await parseAndThrowError( res, shouldParseResponse );
	}
};


export async function parseAndThrowError<T>( response: Response, shouldParseResponse = true ): Promise<T> {
	if ( ! shouldParseResponse ) {
		throw response;
	}

	const error = await parseJsonAndNormalizeError( response );
	const unknownError = {
		code: 'unknown_error',
		message: __( 'An unknown error occurred.' ),
	};
	// Prevent infinite loops when external requests fail.
	if ( 'rest_cookie_invalid_nonce' === error.code && hasExternalNonce() ) {
		error.code = 'external_rest_cookie_invalid_nonce';
	}
	throw error || unknownError;
}
