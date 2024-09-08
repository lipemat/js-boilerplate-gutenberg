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

export interface AuthenticationRestRoute {
	authentication: {
		'application-passwords'?: {
			endpoints: {
				authorization: string
			}
		}
	};
}

export interface AuthenticationFailure {
	code: string;
	message: string;
	data: any;
}

export type AuthorizationParams = {
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

let applicationPassword: string = '';

export function getApplicationPassword(): string {
	return applicationPassword;
}

/**
 * Do we have an application password set?
 */
export function hasApplicationPassword(): boolean {
	return '' !== applicationPassword;
}


/**
 * Remove any previously set application password.
 */
export function clearApplicationPassword(): void {
	applicationPassword = '';
}

/**
 * Authorize a user via the native REST authentication.
 *
 * Adds a known application password to all subsequent requests.
 *
 * @link https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide/
 *
 * @notice Requires 5.6+ of WP core or the "Application Passwords" plugin.
 *
 * @notice Requires authentication to be enabled via .htaccess
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
 * @param {string} password
 */
export function enableApplicationPassword( user: string, password: string ): void {
	applicationPassword = 'Basic ' + btoa( user + ':' + password );
}
