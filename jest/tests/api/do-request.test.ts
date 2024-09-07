import {wpapi} from '../../../src';

const mockResponse = jest.fn();
jest.mock( '../../../src/util/request-handler', () => {
	const fn = function( ...args ) {
		return mockResponse( ...args );
	};
	return {
		fetchHandler: fn,
	};
} );

describe( 'Testing doRequest', () => {
	it( 'Test for ID doubling up', async () => {
		const posts = wpapi( 'default' ).posts();
		await posts.update( {
			id: 1,
			title: 'Test',
		} );
		expect( mockResponse ).toHaveBeenCalledWith( {
			data: {id: 1, title: 'Test'},
			method: 'PATCH',
			parse: true,
			path: '/wp/v2/posts/1',
		} );

		mockResponse.mockClear();
		await posts.update( {
			id: 1,
			title: 'Test',
		} );
		expect( mockResponse ).toHaveBeenCalledWith( {
			data: {id: 1, title: 'Test'},
			method: 'PATCH',
			parse: true,
			path: '/wp/v2/posts/1',
		} );

		await posts.getById( 1 );
		mockResponse.mockClear();
		await posts.getById( 1 );
		expect( mockResponse ).toHaveBeenCalledWith( {
			method: 'GET',
			parse: true,
			path: '/wp/v2/posts/1',
		} );

		await posts.delete( 1 );
		mockResponse.mockClear();
		await posts.delete( 1 );
		expect( mockResponse ).toHaveBeenCalledWith( {
			data: {force: true},
			method: 'DELETE',
			parse: true,
			path: '/wp/v2/posts/1',
		} );

		await posts.trash( 1 );
		mockResponse.mockClear();
		await posts.trash( 1 );
		expect( mockResponse ).toHaveBeenCalledWith( {
			method: 'DELETE',
			parse: true,
			path: '/wp/v2/posts/1',
		} );
	} );
} );
