import {clearApplicationPassword, enableApplicationPassword, restoreNonce, setNonce, setRootURL, wpapi} from '../../../src/index';
import apiFetch from '@wordpress/api-fetch';

global.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
	status: 200,
	json: () => Promise.resolve( {success: true} ),
} ) );

describe( 'request-handler.ts', () => {
	beforeEach( () => {
		// @ts-ignore
		global.fetch.mockClear();
		setRootURL( 'https://example.com' );
		restoreNonce();
		clearApplicationPassword();
	} );

	it( 'Uses default headers', async () => {
		await wpapi().posts().get();
		expect( fetch ).toHaveBeenCalledWith( 'https://example.com/wp/v2/posts?_locale=user', {
			body: undefined,
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
			},
			method: 'GET',
		} );
	} );


	it( 'Uses a root URL', async () => {
		setRootURL( 'https://example.com' );
		await wpapi().posts().get();
		expect( fetch ).toHaveBeenCalledWith( 'https://example.com/wp/v2/posts?_locale=user', {
			body: undefined,
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
			},
			method: 'GET',
		} );

		setRootURL( 'https://bundlephobia.com' );
		await wpapi().posts().get();
		expect( fetch ).toHaveBeenCalledWith( 'https://bundlephobia.com/wp/v2/posts?_locale=user', {
			body: undefined,
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
			},
			method: 'GET',
		} );
	} );


	it( 'Includes a nonce in the request', async () => {
		setNonce( '12345' );
		await wpapi().posts().get();
		expect( fetch ).toHaveBeenCalledWith( 'https://example.com/wp/v2/posts?_locale=user', {
			body: undefined,
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
				'X-WP-Nonce': '12345',
			},
			method: 'GET',
		} );
	} );


	it( 'Includes an application password in the request', async () => {
		await wpapi().posts().get();
		expect( fetch ).toHaveBeenCalledWith( 'https://example.com/wp/v2/posts?_locale=user', {
			body: undefined,
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
			},
			method: 'GET',
		} );

		enableApplicationPassword( 'user', 'password' );
		await wpapi().users().get();
		expect( fetch ).toHaveBeenCalledWith( 'https://example.com/wp/v2/users?_locale=user', {
			body: undefined,
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
				Authorization: 'Basic dXNlcjpwYXNzd29yZA==',
			},
			method: 'GET',
		} );
	} );


	it( 'should update the nonce in requests with outdated', async () => {
		/**
		 * Mimic setting up apiFetch how it is done in page markup.
		 *
		 * @todo Remove this once we move away from apiFetch. We still need the test
		 * to pass, but won't have a purpose to set up apiFetch like this.
		 */
		apiFetch.nonceMiddleware = apiFetch.createNonceMiddleware( 'default' );
		apiFetch.use( apiFetch.nonceMiddleware );
		apiFetch.nonceEndpoint = 'https://example.com/wp-admin/admin-ajax.php?action=rest-nonce';

		// Return invalid nonce response on first request then valid on second and third.
		global.fetch = jest.fn()
			.mockImplementationOnce( () => Promise.resolve( {
				status: 403,
				error: 'rest_cookie_invalid_nonce',
				json: () => Promise.resolve( {
					code: 'rest_cookie_invalid_nonce',
					message: 'Cookie check failed',
					data: {
						status: 403,
					},
				} ),
			} ) )
			.mockImplementationOnce( () => Promise.resolve( {
				status: 200,
				text: () => Promise.resolve( '6666667' ),
			} ) )
			.mockImplementationOnce( () => Promise.resolve( {
				status: 200,
				json: () => Promise.resolve( {success: true} ),
			} ) );


		await wpapi().users().get();
		expect( fetch ).toHaveBeenNthCalledWith( 1, 'https://example.com/wp/v2/users?_locale=user', {
			body: undefined,
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
				'X-WP-Nonce': 'default',
			},
			method: 'GET',
		} );

		expect( fetch ).toHaveBeenNthCalledWith( 2, 'https://example.com/wp-admin/admin-ajax.php?action=rest-nonce' );

		expect( fetch ).toHaveBeenNthCalledWith( 3, 'https://example.com/wp/v2/users?_locale=user', {
			body: undefined,
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
				'X-WP-Nonce': '6666667',
			},
			method: 'GET',
		} );
	} );
} );
