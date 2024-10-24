import {createMethods, type RequestMethods, wpapi} from '../../../src';

const mockResponse = jest.fn();
jest.mock( '../../../src/util/request-handler', () => {
	const fn = function( ...args: never[] ) {
		return mockResponse( ...args );
	};
	return {
		fetchHandler: fn,
	};
} );

describe( 'Testing doRequest', () => {
	it( 'Test for ID doubling up', async () => {
		const posts = wpapi().posts();
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


	it( 'Handles trailing slashes', async () => {
		const posts = wpapi().posts();
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
	} );


	it.each(
		provideEndpoints()
	)( 'Handles endpoint slashes for $case.', async item => {
		expect( item.expected.charAt( item.expected.length - 1 ) ).toBe( '/' );
		expect( item.expected.charAt( 0 ) ).toBe( '/' );

		mockResponse.mockClear();
		await item.endpoint.update( {
			id: 1,
		} );
		expect( mockResponse ).toHaveBeenCalledWith( {
			data: {id: 1},
			method: 'PATCH',
			parse: true,
			path: item.expected + 1,
		} );

		mockResponse.mockClear();
		await item.endpoint.getById( 1 );
		expect( mockResponse ).toHaveBeenCalledWith( {
			method: 'GET',
			parse: true,
			path: item.expected + 1,
		} );

		mockResponse.mockClear();
		await item.endpoint.delete( 1 );
		expect( mockResponse ).toHaveBeenCalledWith( {
			data: {force: true},
			method: 'DELETE',
			parse: true,
			path: item.expected + 1,
		} );
	} );
} );


function provideEndpoints(): Array<{
	case: string,
	endpoint: RequestMethods<object, object, object>,
	expected: string
}> {
	const Routes = {
		noBefore: () => createMethods<object, object, object>( 'wp/v2/no-before/' ),
		noAfter: () => createMethods<object, object, object>( '/wp/v2/no-after' ),
		neither: () => createMethods<object, object, object>( 'wp/v2/neither' ),
	};

	const wp = wpapi( Routes );
	return [
		{
			case: 'posts',
			endpoint: wp.posts(),
			expected: '/wp/v2/posts/',
		},
		{
			case: 'noBefore',
			endpoint: wp.noBefore(),
			expected: '/wp/v2/no-before/',
		},
		{
			case: 'noAfter',
			endpoint: wp.noAfter(),
			expected: '/wp/v2/no-after/',
		},
		{
			case: 'neither',
			endpoint: wp.neither(),
			expected: '/wp/v2/neither/',
		},
	];
}
