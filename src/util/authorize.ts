/**
 * Middleware to handling Application Password authentication.
 *
 * The site running the Rest API must have applications passwords enabled.
 * 1. Be running 5.6+ or have the application passwords plugin installed.
 * 2. Have SSL or 'WP_ENVIRONMENT_TYPE' set to 'local'.
 *
 * @link https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/
 *
 */
import apiFetch from '@wordpress/api-fetch';
import {__} from '@wordpress/i18n';
import {addQueryArgs} from '@wordpress/url';
import {addMiddleware, removeMiddleware} from './middleware';

export interface AuthenticationRestRoute {
	authentication: {
		'application-passwords'?: {
			endpoints: {
				authorization: string
			}
		}
	}
}

export interface AuthenticationFailure {
	code: string;
	message: string;
	data: any
}

export interface AuthorizationParams {
	/* eslint-disable camelcase */
	/**
	 * Plain text application identifier.
	 */
	app_name: string;
	/**
	 * UUID to identify the application.
	 *
	 * @link https://developer.wordpress.org/reference/functions/wp_generate_uuid4/
	 * @link https://www.uuidgenerator.net/
	 */
	app_id?: string; // Must be a UUID.
	/**
	 * URL the user will be redirected to after authorization.
	 * Supports app links (e.g. myapp://).
	 *
	 * Must be an https or application URL.
	 *
	 * If omitted, will display a password to the user.
	 */
	success_url?: string;
	/**
	 * URL the user will be redirected to after authorization.
	 * Supports app links (e.g. myapp://).
	 *
	 * Must be an https or application URL.
	 *
	 * If omitted will use `success_url` with `?success=false` appended.
	 * If `success_url` is also omitted will direct to WP dashboard.
	 */
	reject_url?: string;
	/* eslint-enable camelcase */
}

let applicationPasswordMiddleware: number | undefined;

/**
 * Do we have an application password set?
 */
export function hasApplicationPassword(): boolean {
	return 'undefined' !== typeof applicationPasswordMiddleware;
}


/**
 * Remove any previously set application password.
 */
export function clearApplicationPassword(): void {
	if ( 'undefined' !== typeof applicationPasswordMiddleware ) {
		removeMiddleware( applicationPasswordMiddleware );
		applicationPasswordMiddleware = undefined;
	}
}

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
		const response = await apiFetch<AuthenticationRestRoute>( {
			path: '/',
			method: 'GET',
		} );

		if ( ! response.authentication[ 'application-passwords' ] ) {
			return {
				code: 'application_passwords_disabled',
				message: __( 'Application passwords are not enabled on this site.' ),
				data: null,
			};
		}
		return addQueryArgs( response.authentication[ 'application-passwords' ].endpoints.authorization, data );
	} catch ( error ) {
		return error;
	}
}

/**
 * Authorize a user via the native REST authentication.
 *
 * Adds a known application password to all subsequent requests.
 *
 * @link https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/
 *
 * @requires Version 5.6+ of WP core or the "Application Passwords" plugin.
 *
 * @requires authentication to be enabled via .htaccess
 *
 * # Locally we use `mod_fcgid` on cPanel we use `mod_proxy_fcgi`.
 * <IfModule mod_fcgid.c>
 *   CGIPassAuth on
 * </IfModule>
 * <IfModule mod_proxy_fcgi.c>
 *   CGIPassAuth on
 * </IfModule>
 *
 * @param {string} user
 * @param {string} applicationPassword
 */
export function enableApplicationPassword( user: string, applicationPassword: string ): void {
	clearApplicationPassword();
	applicationPasswordMiddleware = addMiddleware( ( options, next ) => {
		const {headers = {}} = options;
		return next( {
			...options,
			headers: {
				...headers,
				Authorization: 'Basic ' + btoa( user + ':' + applicationPassword ),
			},
		}, next );
	} );
}
