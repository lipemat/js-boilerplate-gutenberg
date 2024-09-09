import {clearApplicationPassword, enableApplicationPassword, restoreNonce, setInitialNonce, setNonce, setRootURL, wpapi} from '../../../src/index';

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


	it( 'Included data in a GET request', async () => {
		await wpapi().posts().get( {per_page: 10} );
		expect( fetch ).toHaveBeenCalledWith( 'https://example.com/wp/v2/posts?per_page=10&_locale=user', {
			body: undefined,
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
			},
			method: 'GET',
		} );
	} );


	it( 'Included data in a POST request', async () => {
		await wpapi().posts().create( {title: 'Hello, world!'} );
		expect( fetch ).toHaveBeenCalledWith( 'https://example.com/wp/v2/posts?_locale=user', {
			body: '{"title":"Hello, world!"}',
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
				'Content-Type': 'application/json',
			},
			method: 'POST',
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
		await wpapi( '' ).users().get();
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
		mockNonceRefresh();

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


	it( 'Should handle none in doRequestWithPagination', async () => {
		mockNonceRefresh();

		await wpapi().posts().getWithPagination( {per_page: 10} );

		expect( fetch ).toHaveBeenNthCalledWith( 1, 'https://example.com/wp/v2/posts?per_page=10&_locale=user', {
			body: undefined,
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
				'X-WP-Nonce': 'default',
			},
			method: 'GET',
		} );

		expect( fetch ).toHaveBeenNthCalledWith( 2, 'https://example.com/wp-admin/admin-ajax.php?action=rest-nonce' );

		expect( fetch ).toHaveBeenNthCalledWith( 3, 'https://example.com/wp/v2/posts?per_page=10&_locale=user', {
			body: undefined,
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
				'X-WP-Nonce': '6666667',
			},
			method: 'GET',
		} );
	} );


	it( 'Does not try to refresh nonce if error code is not rest_cookie_invalid_nonce', async () => {
		expect.assertions( 3 );

		global.fetch = jest.fn()
			.mockImplementationOnce( () => Promise.resolve( {
				status: 403,
				error: 'not_cookie_error',
				json: () => Promise.resolve( {
					code: 'not_cookie_error',
					message: 'Do NOT refresh nonce',
					data: {
						status: 403,
					},
				} ),
			} ) );
		try {
			await wpapi().users().get();
		} catch ( e ) {
			// @ts-ignore
			expect( e.code ).toBe( 'not_cookie_error' );
		}
		expect( fetch ).toHaveBeenCalledWith( 'https://example.com/wp/v2/users?_locale=user', {
			body: undefined,
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
				'X-WP-Nonce': 'default',
			},
			method: 'GET',
		} );

		expect( fetch ).toHaveBeenCalledTimes( 1 );
	} );


	it( 'Does not try to refresh nonce more than once.', async () => {
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
				status: 403,
				error: 'rest_cookie_invalid_nonce',
				json: () => Promise.resolve( {
					code: 'rest_cookie_invalid_nonce',
					message: 'Cookie check failed',
					data: {
						status: 403,
					},
				} ),
			} ) );

		try {
			await wpapi().users().get();
		} catch ( e ) {
			// @ts-ignore
			expect( e.error ).toBe( 'rest_cookie_invalid_nonce' );
		}

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
		expect( fetch ).toHaveBeenCalledTimes( 2 );
	} );


	function mockNonceRefresh() {
		setInitialNonce( 'default' );

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
				headers: new Headers( {
					'X-WP-TotalPages': '1',
					'X-WP-Total': '1',
				} ),
				json: () => Promise.resolve( {success: true} ),
			} ) );
	}
} );
