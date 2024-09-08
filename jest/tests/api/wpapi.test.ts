import {clearNonce, restoreRootURL, setRootURL, wpapi} from '../../../src';

describe( 'Testing wpapi', () => {
	const wp = wpapi( '' );

	beforeEach( () => {
		clearNonce();
		restoreRootURL();
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
} );
