import {clearNonce, hasExternalNonce, restoreNonce, setInitialNonce, setNonce, setRootURL, wpapi} from '../../../../src';
import {isNonceCleared} from '../../../../src/util/nonce';
import type {ErrorResponse} from '../../../../src/util/parse-response';
import {setInitialRootURL} from '../../../../src/util/root-url';

describe( 'Testing nonce', () => {
	const wp = wpapi();
	setInitialNonce( 'default' );

	beforeEach( () => {
		setInitialRootURL( 'http://localhost/wp-json/' );
		clearNonce();
	} );


	/**
	 * All this test proves is if we have a nonce set for an external
	 * site that is incorrect, the request fails.
	 *
	 * We test various ordering of calling `setRootURL` and `setNonce`
	 * to verify under which conditions a nonce is set.
	 */
	it( 'Test for nonce ordering', async () => {
		setRootURL( 'https://onpointplugins.com/wp-json' );
		let posts = await wp.posts().get();
		expect( posts ).toHaveLength( 10 );

		setRootURL( 'https://onpointplugins.com/wp-json' );
		setNonce( 'nothing-good' );
		try {
			await wp.posts().get();
		} catch ( e ) {
			const error = e as ErrorResponse;
			expect( error.code ).toBe( 'external_rest_cookie_invalid_nonce' );
		}
		clearNonce();
		posts = await wp.posts().get();
		expect( posts ).toHaveLength( 10 );

		setNonce( 'not-going-to-work' );
		setRootURL( 'https://onpointplugins.com/wp-json' );
		try {
			await wp.posts().get();
		} catch ( e ) {
			const error = e as ErrorResponse;
			expect( error.code ).toBe( 'external_rest_cookie_invalid_nonce' );
		}
		clearNonce();
		posts = await wp.posts().get();
		expect( posts ).toHaveLength( 10 );
	}, 8_000 );


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
} );
