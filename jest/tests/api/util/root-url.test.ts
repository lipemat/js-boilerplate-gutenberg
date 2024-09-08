import {clearNonce, restoreRootURL, setInitialNonce, setRootURL, wpapi} from '../../../../src';
import {getFullUrl} from '../../../../src/util/root-url';
import type {ErrorResponse} from '../../../../src/util/parse-response';

describe( 'Testing root URL', () => {
	const wp = wpapi();

	beforeEach( () => {
		clearNonce();
		restoreRootURL();
	} );

	it( 'Test outside requests', async () => {
		setInitialNonce( '365edf6304' );
		setRootURL( 'http://starting-point.loc/wp-json/' );
		try {
			await wp.posts().create( {
				title: 'JS test',
			} );
		} catch ( e ) {
			const error = e as ErrorResponse;
			expect( error.code ).toBe( 'rest_cannot_create' );
		}
		setRootURL( 'https://onpointplugins.com/wp-json/' );
		const posts = await wp.posts().get( {
			per_page: 1,
		} );
		expect( posts ).toHaveLength( 1 );
	} );


	it( 'Test for nonce passed with root url', async () => {
		setRootURL( 'https://onpointplugins.com/wp-json', 'still-not-working' );
		try {
			await wp.posts().get();
		} catch ( e ) {
			const error = e as ErrorResponse;
			expect( error.code ).toBe( 'external_rest_cookie_invalid_nonce' );
		}
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
