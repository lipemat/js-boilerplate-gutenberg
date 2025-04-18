import {clearNonce, setRootURL, wpapi} from '../../../src';
import {setInitialRootURL} from '../../../src/util/root-url';

describe( 'Testing wpapi', () => {
	const wp = wpapi( '' );

	beforeEach( () => {
		setInitialRootURL( 'http://localhost/wp-json/' );
		clearNonce();
	} );


	it( 'Test for retrieval', async () => {
		setRootURL( 'https://onpointplugins.com/wp-json' );
		const posts = await wp.posts().get( {
			per_page: 1,
		} );
		expect( posts ).toHaveLength( 1 );

		const single = await wp.posts().getById( posts[ 0 ].id );
		expect( single.title ).toEqual( posts[ 0 ].title );
	} );


	it( 'Test for pagination', async () => {
		setRootURL( 'https://onpointplugins.com/wp-json' );
		const posts = await wp.posts().get();
		expect( posts.length ).toBe( 10 );

		let response = await wp.posts().getWithPagination();
		expect( response.totalPages > 1 ).toBeTruthy();
		expect( response.items.length ).toBe( 10 );

		setRootURL( 'http://starting-point.loc/wp-json/' );
		response = await wp.posts().getWithPagination();
		expect( response.totalPages ).toBe( 2 );
		expect( response.items.length ).toBeGreaterThan( 1 );
	} );


	it( 'Test for fields and embed', async () => {
		setRootURL( 'https://onpointplugins.com/wp-json' );
		let posts = await wp.posts().get( {
			per_page: 1,
			_embed: true,
		} );
		expect( posts[ 0 ]._embedded?.author?.length ).toBe( 1 );

		posts = await wp.posts().get( {
			_fields: [ 'title' ],
		} );
		expect( typeof ( posts[ 0 ].title.rendered ) ).toBe( 'string' );
		expect( posts[ 0 ].content ).toBe( undefined );
	} );


	test( 'Permalinks disabled', async () => {
		global.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			status: 200,
			headers: new Headers(),
			json: () => Promise.resolve( [] ),
		} ) );

		setRootURL( 'https://starting-point.loc/sub/index.php?rest_route=/' );
		await wp.posts().getWithPagination( {
			categories: [ 1 ],
		} );
		expect( global.fetch ).toHaveBeenCalledWith( 'https://starting-point.loc/sub/index.php?rest_route=%2Fwp%2Fv2%2Fposts&categories%5B0%5D=1&_locale=user', {
			body: undefined,
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
			},
			method: 'GET',
		} );
	} );

	test( 'Nested objects in query arguments', async () => {
		global.fetch = jest.fn().mockImplementation( () => Promise.resolve( {
			status: 200,
			headers: new Headers(),
			json: () => Promise.resolve( [] ),
		} ) );

		setRootURL( 'https://starting-point.loc/sub/index.php?rest_route=/' );

		await wp.posts().getWithPagination( {
			categories: [ 1 ],
			// @ts-expect-error
			meta_query: {
				key: 'meta_key',
				value: 'meta_value',
				nested: {
					key: 'nested_key',
					value: 'nested_value',
				},
			},
		} );
		expect( global.fetch ).toHaveBeenCalledWith( 'https://starting-point.loc/sub/index.php?rest_route=%2Fwp%2Fv2%2Fposts&categories%5B0%5D=1&meta_query%5Bkey%5D=meta_key&meta_query%5Bvalue%5D=meta_value&meta_query%5Bnested%5D%5Bkey%5D=nested_key&meta_query%5Bnested%5D%5Bvalue%5D=nested_value&_locale=user', {
			body: undefined,
			credentials: 'include',
			headers: {
				Accept: 'application/json, */*;q=0.1',
			},
			method: 'GET',
		} );
	} );
} );
