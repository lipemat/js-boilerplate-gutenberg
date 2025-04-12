import {addQueryArgs, buildQueryString, getFragment, getQueryArg, getQueryArgs, getQueryString} from '../../../src/index';


/**
 * Tests taken from the `@wordpress/url` package to guarantee our
 * signature is the same.
 */

describe( 'getQueryString', () => {
	it( 'returns the query string of a URL', () => {
		expect(
			getQueryString(
				'http://user:password@www.test-this.com:1020/test-path/file.extension?query=params&more#anchor'
			)
		).toBe( 'query=params&more' );
		expect(
			getQueryString( 'https://wordpress.org/test-path?query' )
		).toBe( 'query' );
		expect(
			getQueryString(
				'https://www.google.com/search?source=hp&ei=tP7kW8-_FoK89QORoa2QBQ&q=test+url&oq=test+url&gs_l=psy-ab.3..0l10'
			)
		).toBe(
			'source=hp&ei=tP7kW8-_FoK89QORoa2QBQ&q=test+url&oq=test+url&gs_l=psy-ab.3..0l10'
		);
		expect(
			getQueryString( 'https://wordpress.org/this%20is%20a%20test?query' )
		).toBe( 'query' );
		expect(
			getQueryString(
				'https://wordpress.org/test?query=something%20with%20spaces'
			)
		).toBe( 'query=something%20with%20spaces' );
		expect(
			getQueryString(
				'https://andalouses.example/beach?foo[]=bar&foo[]=baz'
			)
		).toBe( 'foo[]=bar&foo[]=baz' );
		expect( getQueryString( 'https://test.com?foo[]=bar&foo[]=baz' ) ).toBe(
			'foo[]=bar&foo[]=baz'
		);
		expect(
			getQueryString( 'https://test.com?foo=bar&foo=baz?test' )
		).toBe( 'foo=bar&foo=baz?test' );
	} );

	it( 'returns the query string of a path', () => {
		expect( getQueryString( '/wp-json/wp/v2/posts?type=page' ) ).toBe(
			'type=page'
		);

		expect( getQueryString( '/wp-json/wp/v2/posts' ) ).toBeUndefined();
	} );

	it( 'returns undefined when the provided does not contain a url query string', () => {
		expect( getQueryString( '' ) ).toBeUndefined();
		expect(
			getQueryString(
				'https://user:password@www.test-this.com:1020/test-path/file.extension#anchor?query=params&more'
			)
		).toBeUndefined();
		expect(
			getQueryString( 'https://wordpress.org/test-path#anchor' )
		).toBeUndefined();
		expect(
			getQueryString( 'https://wordpress.org/this%20is%20a%20test' )
		).toBeUndefined();
		expect(
			getQueryString( 'https://wordpress.org#test' )
		).toBeUndefined();
		expect( getQueryString( 'https://wordpress.org/' ) ).toBeUndefined();
		expect( getQueryString( 'https://localhost:8080' ) ).toBeUndefined();
		expect( getQueryString( 'invalid' ) ).toBeUndefined();
		expect(
			getQueryString( 'https://example.com/empty?' )
		).toBeUndefined();
	} );
} );

describe( 'buildQueryString', () => {
	it( 'builds simple strings', () => {
		const data = {
			foo: 'bar',
			baz: 'boom',
			cow: 'milk',
			php: 'hypertext processor',
		};

		expect( buildQueryString( data ) ).toBe(
			'foo=bar&baz=boom&cow=milk&php=hypertext%20processor'
		);
	} );

	it( 'builds complex data', () => {
		const data = {
			user: {
				name: 'Bob Smith',
				age: 47,
				sex: 'M',
				dob: '5/12/1956',
			},
			pastimes: [ 'golf', 'opera', 'poker', 'rap' ],
			children: {
				bobby: {age: 12, sex: 'M'},
				sally: {age: 8, sex: 'F'},
			},
		};

		expect( buildQueryString( data ) ).toBe(
			'user%5Bname%5D=Bob%20Smith&user%5Bage%5D=47&user%5Bsex%5D=M&user%5Bdob%5D=5%2F12%2F1956&pastimes%5B0%5D=golf&pastimes%5B1%5D=opera&pastimes%5B2%5D=poker&pastimes%5B3%5D=rap&children%5Bbobby%5D%5Bage%5D=12&children%5Bbobby%5D%5Bsex%5D=M&children%5Bsally%5D%5Bage%5D=8&children%5Bsally%5D%5Bsex%5D=F'
		);
	} );

	it( 'builds falsey values', () => {
		const data = {
			empty: '',
			null: null,
			undefined,
			zero: 0,
		};
		// @ts-expect-error -- Not typing with undefined, but supporting it.
		expect( buildQueryString( data ) ).toBe( 'empty=&null=&zero=0' );
	} );

	it( 'builds an empty object as an empty string', () => {
		expect( buildQueryString( {} ) ).toBe( '' );
	} );
} );

describe( 'getFragment', () => {
	it( 'returns the fragment of a URL', () => {
		expect(
			getFragment(
				'https://user:password@www.test-this.com:1020/test-path/file.extension#fragment?query=params&more'
			)
		).toBe( '#fragment' );
		expect(
			getFragment(
				'http://user:password@www.test-this.com:1020/test-path/file.extension?query=params&more#fragment'
			)
		).toBe( '#fragment' );
		expect( getFragment( 'relative/url/#fragment' ) ).toBe( '#fragment' );
		expect( getFragment( '/absolute/url/#fragment' ) ).toBe( '#fragment' );
	} );

	it( 'returns undefined when the provided does not contain a url fragment', () => {
		expect( getFragment( '' ) ).toBeUndefined();
		expect(
			getFragment( 'https://wordpress.org/test-path?query' )
		).toBeUndefined();
		expect(
			getFragment( 'https://wordpress.org/test-path' )
		).toBeUndefined();
		expect(
			getFragment( 'https://wordpress.org/this%20is%20a%20test' )
		).toBeUndefined();
		expect(
			getFragment(
				'https://www.google.com/search?source=hp&ei=tP7kW8-_FoK89QORoa2QBQ&q=test+url&oq=test+url&gs_l=psy-ab.3..0l10'
			)
		).toBeUndefined();
		expect( getFragment( 'https://wordpress.org' ) ).toBeUndefined();
		expect( getFragment( 'https://localhost:8080' ) ).toBeUndefined();
		expect( getFragment( 'https://' ) ).toBeUndefined();
		expect( getFragment( 'https:///test' ) ).toBeUndefined();
		expect( getFragment( 'https://?' ) ).toBeUndefined();
		expect( getFragment( 'test.com' ) ).toBeUndefined();
	} );
} );

describe( 'addQueryArgs', () => {
	it( 'should append args to a URL without query string', () => {
		const url = 'https://andalouses.example/beach';
		const args = {sun: 'true', sand: 'false'};

		expect( addQueryArgs( url, args ) ).toBe(
			'https://andalouses.example/beach?sun=true&sand=false'
		);
	} );

	it( 'should append args to a URL with query string', () => {
		const url = 'https://andalouses.example/beach?night=false';
		const args = {sun: 'true', sand: 'false'};

		expect( addQueryArgs( url, args ) ).toBe(
			'https://andalouses.example/beach?night=false&sun=true&sand=false'
		);
	} );

	it( 'should update args to an URL with conflicting query string', () => {
		const url =
			'https://andalouses.example/beach?night=false&sun=false&sand=true';
		const args = {sun: 'true', sand: 'false'};

		expect( addQueryArgs( url, args ) ).toBe(
			'https://andalouses.example/beach?night=false&sun=true&sand=false'
		);
	} );

	it( 'should update args to an URL with array parameters', () => {
		const url = 'https://andalouses.example/beach?time[]=10&time[]=11';
		const args = {beach: [ 'sand', 'rock' ]};

		expect( decodeURI( addQueryArgs( url, args ) ) ).toBe(
			'https://andalouses.example/beach?time[0]=10&time[1]=11&beach[0]=sand&beach[1]=rock'
		);
	} );

	it( 'should disregard keys with undefined values', () => {
		const url = 'https://andalouses.example/beach';
		const args = {sun: 'true', sand: undefined};

		// @ts-expect-error -- Not typing with undefined, but supporting it.
		expect( addQueryArgs( url, args ) ).toBe(
			'https://andalouses.example/beach?sun=true'
		);
	} );

	it( 'should encode spaces by RFC 3986', () => {
		const url = 'https://andalouses.example/beach';
		const args = {activity: 'fun in the sun'};

		expect( addQueryArgs( url, args ) ).toBe(
			'https://andalouses.example/beach?activity=fun%20in%20the%20sun'
		);
	} );

	it( 'should return only querystring when passed undefined url', () => {
		const url = undefined;
		const args = {sun: 'true'};

		expect( addQueryArgs( url, args ) ).toBe( '?sun=true' );
	} );

	it( 'should add query args before the url fragment', () => {
		const url = 'https://andalouses.example/beach/#fragment';
		const args = {sun: 'true'};

		expect( addQueryArgs( url, args ) ).toBe(
			'https://andalouses.example/beach/?sun=true#fragment'
		);
	} );

	it( 'should return URL argument unaffected if no query arguments to append', () => {
		[ '', 'https://example.com', 'https://example.com?' ].forEach(
			url => {
				[ undefined, {} ].forEach( args => {
					expect( addQueryArgs( url, args ) ).toBe( url );
				} );
			}
		);
	} );
} );

describe( 'getQueryArgs', () => {
	it( 'should parse simple query arguments', () => {
		const url = 'https://andalouses.example/beach?foo=bar&baz=quux';

		expect( getQueryArgs( url ) ).toEqual( {
			foo: 'bar',
			baz: 'quux',
		} );
	} );

	it( 'should accumulate array of values', () => {
		const url =
			'https://andalouses.example/beach?foo[]=zero&foo[]=one&foo[]=two';

		expect( getQueryArgs( url ) ).toEqual( {
			foo: [ 'zero', 'one', 'two' ],
		} );
	} );

	it( 'should accumulate keyed array of values', () => {
		const url =
			'https://andalouses.example/beach?foo[1]=one&foo[0]=zero&foo[]=two';

		expect( getQueryArgs( url ) ).toEqual( {
			foo: [ 'zero', 'one', 'two' ],
		} );
	} );

	it( 'should accumulate object of values', () => {
		const url =
			'https://andalouses.example/beach?foo[zero]=0&foo[one]=1&foo[]=empty';

		expect( getQueryArgs( url ) ).toEqual( {
			foo: {
				'': 'empty',
				zero: '0',
				one: '1',
			},
		} );
	} );

	it( 'normalizes mixed numeric and named keys', () => {
		const url = 'https://andalouses.example/beach?foo[0]=0&foo[one]=1';

		expect( getQueryArgs( url ) ).toEqual( {
			foo: {
				0: '0',
				one: '1',
			},
		} );
	} );

	it( 'should return empty object for URL without querystring', () => {
		const urlWithoutQuerystring = 'https://andalouses.example/beach';
		const urlWithEmptyQuerystring = 'https://andalouses.example/beach?';
		const invalidURL = 'example';

		expect( getQueryArgs( invalidURL ) ).toEqual( {} );
		expect( getQueryArgs( urlWithoutQuerystring ) ).toEqual( {} );
		expect( getQueryArgs( urlWithEmptyQuerystring ) ).toEqual( {} );
	} );

	it( 'should gracefully handle empty keys and values', () => {
		const url = 'https://andalouses.example/beach?&foo';

		expect( getQueryArgs( url ) ).toEqual( {
			foo: '',
		} );
	} );

	describe( 'reverses buildQueryString', () => {
		it( 'unbuilds simple strings', () => {
			const data = {
				foo: 'bar',
				baz: 'boom',
				cow: 'milk',
				php: 'hypertext processor',
			};

			expect(
				getQueryArgs(
					'https://example.com/?foo=bar&baz=boom&cow=milk&php=hypertext%20processor'
				)
			).toEqual( data );
		} );

		it( 'unbuilds complex data, with stringified values', () => {
			const data = {
				user: {
					name: 'Bob Smith',
					age: '47',
					sex: 'M',
					dob: '5/12/1956',
				},
				pastimes: [ 'golf', 'opera', 'poker', 'rap' ],
				children: {
					bobby: {age: '12', sex: 'M'},
					sally: {age: '8', sex: 'F'},
				},
			};

			expect(
				getQueryArgs(
					'https://example.com/?user%5Bname%5D=Bob%20Smith&user%5Bage%5D=47&user%5Bsex%5D=M&user%5Bdob%5D=5%2F12%2F1956&pastimes%5B0%5D=golf&pastimes%5B1%5D=opera&pastimes%5B2%5D=poker&pastimes%5B3%5D=rap&children%5Bbobby%5D%5Bage%5D=12&children%5Bbobby%5D%5Bsex%5D=M&children%5Bsally%5D%5Bage%5D=8&children%5Bsally%5D%5Bsex%5D=F'
				)
			).toEqual( data );
		} );

		it( 'should not blow up on malformed params', () => {
			jest.spyOn( global.console, 'debug' ).mockImplementation( () => jest.fn() );
			const url = 'https://andalouses.example/beach?foo=bar&baz=%E0%A4%A';

			expect( () => getQueryArgs( url ) ).not.toThrow();
			expect( getQueryArgs( url ) ).toEqual( {
				baz: '%E0%A4%A',
				foo: 'bar',
			} );

			expect( global.console.debug ).toHaveBeenCalledTimes( 2 );
		} );
	} );
} );

describe( 'getQueryArg', () => {
	it( 'should get the value of an existing query arg', () => {
		const url = 'https://andalouses.example/beach?foo=bar&bar=baz';

		expect( getQueryArg( url, 'foo' ) ).toBe( 'bar' );
	} );

	it( 'should not return a value of an unknown query arg', () => {
		const url = 'https://andalouses.example/beach?foo=bar&bar=baz';

		expect( getQueryArg( url, 'baz' ) ).toBeUndefined();
	} );

	it( 'should not return what looks like a query arg after the url fragment', () => {
		const url = 'https://andalouses.example/beach#fragment?foo=bar&bar=baz';

		expect( getQueryArg( url, 'foo' ) ).toBeUndefined();
	} );

	it( 'should get the value of an array query arg', () => {
		const url = 'https://andalouses.example/beach?foo[]=bar&foo[]=baz';

		expect( getQueryArg( url, 'foo' ) ).toEqual( [ 'bar', 'baz' ] );
	} );

	it( 'continues to work when an anchor follows the query string', () => {
		const url = 'https://andalouses.example/beach?foo=bar&bar=baz#foo';

		expect( getQueryArg( url, 'foo' ) ).toEqual( 'bar' );
		expect( getQueryArg( url, 'bar' ) ).toEqual( 'baz' );
	} );
} );
