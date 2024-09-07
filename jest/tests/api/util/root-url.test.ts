import {clearNonce, restoreRootURL, setInitialNonce, setRootURL, wpapi} from '../../../../src';
import apiFetch from '@wordpress/api-fetch';
import {getFullUrl} from '../../../../src/util/root-url';

describe( 'Testing root URL', () => {
	const wp = wpapi();
	setInitialNonce( 'default' );

	beforeEach( () => {
		clearNonce();
		restoreRootURL();
	} );

	it( 'Test outside requests', async () => {
		apiFetch.use( apiFetch.createNonceMiddleware( '365edf6304' ) );
		apiFetch.use( apiFetch.createRootURLMiddleware( 'http://starting-point.loc/wp-json/' ) );

		let error;
		try {
			await wp.posts().create( {
				title: 'JS test',
			} );
		} catch ( e ) {
			error = {
				code: 'fetch_error',
			};
		}
		expect( error.code ).toBe( 'fetch_error' );
		setRootURL( 'https://onpointplugins.com/wp-json/' );
		const posts = await wp.posts().get( {
			per_page: 1,
		} );
		expect( posts ).toHaveLength( 1 );
	} );


	it( 'Test for nonce passed with root url', async () => {
		setRootURL( 'https://onpointplugins.com/wp-json', 'still-not-working' );
		let error;
		try {
			await wp.posts().get();
		} catch ( e ) {
			error = e;
		}
		expect( error.code ).toBe( 'external_rest_cookie_invalid_nonce' );
		clearNonce();
		const posts = await wp.posts().get();
		expect( posts ).toHaveLength( 10 );
	} );


	test( 'getFullURL', () => {
		const fullURL = getFullUrl( {
			path: '/wp/v2/posts',
		} );
		expect( fullURL ).toBe( 'http://localhost/wp-json/wp/v2/posts?_locale=user' );

		setRootURL( 'https://onpointplugins.com/wp-json' );
		const fullURL2 = getFullUrl( {
			path: '/wp/v2/users',
		} );
		expect( fullURL2 ).toBe( 'https://onpointplugins.com/wp-json/wp/v2/users?_locale=user' );

		const fullURL3 = getFullUrl( {
			url: 'https://someotherplace.com/nothing',
		} );
		expect( fullURL3 ).toBe( 'https://someotherplace.com/nothing?_locale=user' );

		const fullURL4 = getFullUrl( {
			url: 'https://someotherplace.com/nothing?_locale=site&per_page=10',
		} );
		expect( fullURL4 ).toBe( 'https://someotherplace.com/nothing?_locale=site&per_page=10' );
	} );
} );
