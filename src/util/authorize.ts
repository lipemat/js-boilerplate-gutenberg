/**
 * Middleware to handling basic authentication.
 *
 * The site running the Rest API must support basic authentication.
 * Works out of the box with `Lipe\Lib\Rest_Api`
 *
 * @link https://github.com/lipemat/wordpress-libs/blob/master/src/Rest_Api/Login.php
 *
 * @see E:\SVN\starting-point\wp-content\mu-plugins\rest-authentication.php
 */
import Cookies from 'js-cookie';
import apiFetch from '@wordpress/api-fetch';
import {__} from '@wordpress/i18n';

export interface AuthenticationResult {
	user_id: number, // eslint-disable-line camelcase
	token: string;
	expires: string;
}

export interface AuthenticationFailure {
	code: string;
	message: string;
	data: any
}

export interface Credentials {
	user: string;
	password: string;
}

const COOKIE = '@lipemat/js-boilerplate-gutenberg/util/basic-auth/token';

export function isLoggedIn(): boolean {
	return false !== getCurrentAuth();
}

export function getCurrentAuth(): AuthenticationResult | false {
	const cookieValue = Cookies.get( COOKIE );
	return ! cookieValue ? false : JSON.parse( cookieValue );
}

/**
 * Logout the currently authorized user.
 *
 * Returns true if a user was logged in and false
 * if they were not.
 *
 * @return boolean
 */
export function logOut(): boolean {
	if ( getCurrentAuth() ) {
		Cookies.remove( COOKIE );
		return true;
	}
	return false;
}

/**
 * Log a user in and set a cookie to be used on all REST requests.
 * Cookie expires (typically after 7 days) so you must check `isLoggedIn` from
 * time to time and log the user in again.
 *
 * Should only be called once per application vs before every request.
 *
 * @param {Credentials} credentials - Credentials
 * @param {string} path - Path of REST endpoint for logging in (defaults to `Lipe\Lib\Rest_Api's endpoint)
 *
 */
export async function authorize( credentials: Credentials, path: string = '/auth/v1/login/' ): Promise<AuthenticationResult | AuthenticationFailure> {
	if ( ! isLoggedIn() ) {
		try {
			const response = await apiFetch<AuthenticationResult>( {
				path,
				method: 'POST',
				headers: {
					Authorization: 'Basic ' + btoa( credentials.user + ':' + credentials.password ),
				},
			} );

			if ( response.token ) {
				const expires = new Date( response.expires.replace( ' ', 'T' ) );
				Cookies.set( COOKIE, response, {expires} );
			}
			return response;
		} catch ( error ) {
			return error;
		}
	}
	return getCurrentAuth() || {
		code: 'invalid auth',
		message: __( 'Auth cookie is invalid' ),
		data: null,
	};
}

/**
 * Enables basic auth support on all following requests.
 *
 * The authorization cookie is set via `authorize` and this
 * function won't do anything without the cookie.
 *
 * Typically you call this in once for the application or section
 * that will need authorization and manage the actual login via authorize.
 *
 * @see authorize
 */
export default function enabledBasicAuth(): void {
	apiFetch.use( ( options, next ) => {
		const auth = getCurrentAuth();
		if ( auth ) {
			const {headers = {}} = options;
			return next( {
				...options,
				headers: {
					...headers,
					'Authorization': 'Bearer ' + auth.token,
				},
			}, next );
		}
		return next( options, next );
	} );
}
