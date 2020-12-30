import {
	addMiddleware,
	clearNonce,
	hasExternalNonce,
	removeMiddleware,
	restoreNonce,
	setRootURL,
	wpapi,
} from '../../src';
import apiFetch from '@wordpress/api-fetch';
import {isNonceCleared, setNonce} from '../../src/util/nonce';
import {createRunStep} from '../../src/util/request-handler';
import {restoreRootURL} from '../../src/util/root-url';
import {clearAllMiddleware, getAllMiddleware} from '../../src/util/middleware';

describe( 'Testing wpapi', () => {
	const wp = wpapi();

	beforeEach( () => {
		jest.spyOn( global.console, 'error' ).mockImplementation( () => jest.fn() );
		clearNonce();
		restoreRootURL();
	} );

	it( 'Test for retrieval', async() => {
		setRootURL( 'https://onpointplugins.com/wp-json' );
		const posts = await wp.posts().get( {
			per_page: 1,
		} );
		expect( posts ).toHaveLength( 1 );

		const single = await wp.posts().getById( posts[ 0 ].id );
		expect( single.title ).toEqual( posts[ 0 ].title );
	} );

	it( 'Test for  pagination', async() => {
		setRootURL( 'https://onpointplugins.com/wp-json' );
		const posts = await wp.posts().get();
		expect( posts.length ).toBe( 10 );

		let response = await wp.posts().getWithPagination();
		expect( response.totalPages > 1 ).toBeTruthy();
		expect( response.items.length ).toBe( 10 );

		setRootURL( 'http://starting-point.loc/wp-json/' );
		response = await wp.posts().getWithPagination();
		expect( response.totalPages ).toBe( 1 );
		expect( response.items.length ).toBeGreaterThan( 1 );
	} );

	it( 'Test for fields and embed', async() => {
		setRootURL( 'https://onpointplugins.com/wp-json' );
		let posts = await wp.posts().get( {
			per_page: 1,
			_embed: true,
		} );
		expect( posts[ 0 ]._embedded.author.length ).toBe( 1 );

		posts = await wp.posts().get( {
			_fields: [ 'title' ],
		} );
		expect( typeof ( posts[ 0 ].title.rendered ) ).toBe( 'string' );
		expect( posts[ 0 ].content ).toBe( undefined );
	} );


	it( 'Test outside requests', async() => {
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


	/**
	 * All this test proves is if we have a nonce set for an external
	 * site that is not correct, the request fails.
	 *
	 * We test various ordering of calling `setRootURL` and `setNonce`
	 * to verify under which conditions a nonce is set.
	 */
	it( 'Test for nonce ordering', async() => {
		setRootURL( 'https://onpointplugins.com/wp-json' );
		let posts = await wp.posts().get();
		expect( posts ).toHaveLength( 10 );

		setRootURL( 'https://onpointplugins.com/wp-json' );
		setNonce( 'nothing-good' );
		let error;
		try {
			await wp.posts().get();
		} catch ( e ) {
			error = e;
		}
		expect( error.code ).toBe( 'external_rest_cookie_invalid_nonce' );
		clearNonce();
		posts = await wp.posts().get();
		expect( posts ).toHaveLength( 10 );

		setNonce( 'not-going-to-work' );
		setRootURL( 'https://onpointplugins.com/wp-json' );
		try {
			await wp.posts().get();
		} catch ( e ) {
			error = e;
		}
		expect( error.code ).toBe( 'external_rest_cookie_invalid_nonce' );
		clearNonce();
		posts = await wp.posts().get();
		expect( posts ).toHaveLength( 10 );
	} );

	it( 'Test middleware ordering', () => {
		clearAllMiddleware();
		const first = addMiddleware( ( o, n ) => n( 'first' ) );
		const second = addMiddleware( ( o, n ) => n( 'second' ) );
		const third = addMiddleware( ( o, n ) => n( 'third' ) );

		expect( first ).toBe( 0 );
		expect( second ).toBe( 1 );
		expect( third ).toBe( 2 );

		removeMiddleware( second );
		expect( addMiddleware( ( o, n ) => n( 'fourth' ) ) ).toBe( 3 );
		expect( getAllMiddleware().length ).toBe( 4 );
		expect( createRunStep( 0, getAllMiddleware().filter( Boolean ) )( {} ) ).toBe( 'fourth' );
		removeMiddleware( 3 );
		removeMiddleware( 0 );
		expect( createRunStep( 0, getAllMiddleware().filter( Boolean ) )( {} ) ).toBe( 'third' );
		clearAllMiddleware();
	} );

	it( 'Test Restore Nonce', () => {
		restoreNonce();
		expect( isNonceCleared() ).toBeFalsy();
		setNonce( 'arbitrary' );
		expect( hasExternalNonce() ).toBeTruthy();
		expect( isNonceCleared() ).toBeFalsy();

		clearNonce();
		expect( isNonceCleared() ).toBeTruthy();
		expect( hasExternalNonce() ).toBeFalsy();

		setNonce( 'arbitrary' );
		expect( hasExternalNonce() ).toBeTruthy();
		expect( isNonceCleared() ).toBeFalsy();

		restoreNonce();
		expect( hasExternalNonce() ).toBeFalsy();
		expect( isNonceCleared() ).toBeFalsy();
	} );


	it( 'Test for nonce passed with root url', async() => {
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

} );
