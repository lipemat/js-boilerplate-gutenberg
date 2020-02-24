import {setRootURL, wpapi} from '../../src';
import enableBasicAuth, {authorize} from '../../src/util/authorize';

require( 'unfetch/polyfill' ); // So we can use window.fetch.

describe( 'Testing wpapi', () => {
	const wp = wpapi();

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

	it( 'Test basic auth', async() => {
		setRootURL( 'http://starting-point.loc/wp-json/' );
		let auth = await authorize( {user: 'testxxx', password: 'testxx'} );
		expect( auth.code ).toBe( 'invalid_username' );
		auth = await authorize( {user: 'test', password: 'test'} );
		expect( auth.token ).toBeTruthy();
	} );

	it( 'Test CRUD', async() => {
		setRootURL( 'http://starting-point.loc/wp-json/' );
		enableBasicAuth();
		await authorize( {user: 'test', password: 'test'} );

		const post = await wp.posts().create( {
			title: 'From JS Unit',
			status: 'publish',
		} );
		expect( post ).toStrictEqual( await wp.posts().getById( post.id, {context: 'edit'} ) );

		const result = await wp.posts().update( {
			id: post.id,
			content: 'XXXX',
			title: {
				raw: 'TTTT',
			},
		} );
		expect( result.title.raw ).toBe( 'TTTT' );
		expect( result.content.raw ).toBe( 'XXXX' );
		const updated = await wp.posts().getById( post.id );
		expect( updated.content.rendered ).toBe( '<p>XXXX</p>\n' );

		const deleted = await wp.posts().delete( post.id, true );
		expect( deleted ).toBe( 4 );

	} );
} );
