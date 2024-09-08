import {clearNonce, restoreRootURL, setInitialNonce, setRootURL, wpapi} from '../../../../src';
import {getFullUrl, getRootURL, setInitialRootURL} from '../../../../src/util/root-url';
import type {ErrorResponse} from '../../../../src/util/parse-response';

describe( 'Testing root URL', () => {
	const wp = wpapi();

	beforeEach( () => {
		clearNonce();
		setInitialRootURL( '' );
		document.head.innerHTML = '';
		delete window.wpApiSettings;
		delete window.ajaxurl;
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
		setInitialRootURL( 'http://localhost/wp-json/' );
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


	test( 'setInitialRootURL', () => {
		setRootURL( 'https://onpointplugins.com/wp-json' );
		expect( getRootURL() ).toBe( 'https://onpointplugins.com/wp-json/' );

		expect( () => restoreRootURL() ).toThrow( URIError );
		expect( () => getRootURL() ).toThrow( URIError );

		setInitialRootURL( 'https://example.com/wp-json/' );
		expect( getRootURL() ).toBe( 'https://example.com/wp-json/' );
		setRootURL( 'https://onpointplugins.com/wp-json' );
		expect( getRootURL() ).toBe( 'https://onpointplugins.com/wp-json/' );
		restoreRootURL();
		expect( getRootURL() ).toBe( 'https://example.com/wp-json/' );
	} );


	test( 'restoreRootURL', () => {
		setRootURL( 'https://onpointplugins.com/wp-json' );
		expect( getRootURL() ).toBe( 'https://onpointplugins.com/wp-json/' );

		expect( () => restoreRootURL() ).toThrow( URIError );
		expect( () => getRootURL() ).toThrow( URIError );

		setInitialRootURL( 'https://example.com/wp-json/' );
		expect( getRootURL() ).toBe( 'https://example.com/wp-json/' );
		setRootURL( 'https://onpointplugins.com/wp-json' );
		expect( getRootURL() ).toBe( 'https://onpointplugins.com/wp-json/' );
		restoreRootURL();
		expect( getRootURL() ).toBe( 'https://example.com/wp-json/' );

		setInitialRootURL( '' );
		window.ajaxurl = '/wp-admin/admin-ajax.php';
		expect( getRootURL() ).toBe( 'http://localhost/wp-json/' );

		restoreRootURL();
		expect( getRootURL() ).toBe( 'http://localhost/wp-json/' );
	} );


	it( 'Gets root URL from document link', () => {
		expect( () => getRootURL() ).toThrow( URIError );

		const link = document.createElement( 'link' );
		link.rel = 'https://api.w.org/';
		link.href = 'https://onpointplugins.com/sub/wp-json';
		document.head.appendChild( link );
		expect( getRootURL() ).toBe( 'https://onpointplugins.com/sub/wp-json/' );

		setRootURL( 'https://onpointplugins.com/wp-json' );
		expect( getRootURL() ).toBe( 'https://onpointplugins.com/wp-json/' );
	} );


	it( 'Gets root URL from wpApiSettings', () => {
		expect( () => getRootURL() ).toThrow( URIError );

		window.wpApiSettings = {
			root: 'https://onpointplugins.com/wp-json',
			nonce: '',
			versionString: 'wp/v2',
		};
		expect( getRootURL() ).toBe( 'https://onpointplugins.com/wp-json/' );
	} );


	it( 'Gets root URL from ajaxurl', () => {
		expect( () => getRootURL() ).toThrow( URIError );

		window.ajaxurl = '/sub/wp-admin/admin-ajax.php';
		expect( getRootURL() ).toBe( 'http://localhost/sub/wp-json/' );
		const fullURL3 = getFullUrl( {
			path: 'wp/v2/posts',
		} );
		expect( fullURL3 ).toBe( 'http://localhost/sub/wp-json/wp/v2/posts?_locale=user' );

		window.ajaxurl = 'https://fullurl.com/wp-admin/admin-ajax.php';
		restoreRootURL();
		expect( getRootURL() ).toBe( 'https://fullurl.com/wp-json/' );
	} );
} );
