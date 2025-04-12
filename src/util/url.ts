import type {QueryArgObject, QueryArgParsed} from '@wordpress/url';

/**
 * Taken nearly verbatim from `@wordpress/url` package.
 * Maintained here to avoid a circular dependency on `@wordpress/url` package
 * and to keep the package size small.
 */


/**
 * Returns a single query argument of the url
 *
 * @example
 * ```ts
 * const foo = getQueryArg('https://wordpress.org?foo=bar&bar=baz', 'foo'); // bar
 * ```
 */
export function getQueryArg<T extends QueryArgParsed>( url: string, arg: string ): T | undefined {
	return getQueryArgs<{ [ arg ]: T }>( url )[ arg ] ?? undefined;
}

/**
 * Returns an object of query arguments of the given URL.
 * If the given URL is invalid or has no querystring, an empty object is returned.
 *
 *
 * @example
 * ```ts
 * const foo = getQueryArgs( 'https://wordpress.org?foo=bar&bar=baz' );
 * // { "foo": "bar", "bar": "baz" }
 * ```
 */
export function getQueryArgs<T extends QueryArgObject>( url: string ): T {
	const queryString = getQueryString( url ) ?? '';

	return queryString
		.replace( /\+/g, '%20' )
		.split( '&' )
		.reduce( ( accumulator, keyValue ) => {
			if ( '' === keyValue ) {
				return accumulator;
			}
			const [ key, value = '' ] = keyValue
				.split( '=' )
				.filter( Boolean )
				.map( ( urlComponent: string ) => {
					try {
						return decodeURIComponent( urlComponent );
					} catch ( error ) {
						console.debug( `Invalid URL component: ${urlComponent}`, error );
						return urlComponent;
					}
				} );
			const segments = key.replace( /]/g, '' ).split( '[' );
			setPath( accumulator, segments, value );
			return accumulator;
		}, Object.create( null ) );
}

/**
 * Returns the query string part of the URL.
 *
 * @param {string} url The full URL.
 *
 * @example
 * ```ts
 * const queryString = getQueryString('http://localhost:8080/this/is/a/test?query=true#fragment'); // 'query=true'
 * ```
 */
export function getQueryString( url: string ): string | undefined {
	try {
		const queryString = new URL( url, 'https://ex.com' ).search.substring( 1 );
		return queryString.length > 0 ? queryString : undefined;
	} catch ( urlError ) {
		console.debug( 'Invalid URL:', url, urlError );
		return undefined;
	}
}

/**
 * Appends arguments as querystring to the provided URL. If the URL already
 * includes query arguments, the arguments are merged with (and take precedent
 * over) the existing set.
 *
 * @param {string} [url=''] URL to which arguments should be appended. If omitted,
 *                          only the resulting querystring is returned.
 * @param {Object} [args]   Query arguments to apply to URL.
 *
 * @example
 * ```ts
 * const newURL = addQueryArgs('https://google.com', { q: 'test' } ); // https://google.com/?q=test
 * ```
 */
export function addQueryArgs( url: string | undefined, args: QueryArgObject = {} ): string {
	if ( 0 === Object.keys( args ).length ) {
		return url ?? '';
	}

	let baseUrl = '';
	let fragment = '';
	if ( undefined !== url ) {
		fragment = getFragment( url ) ?? '';
		baseUrl = url.replace( fragment, '' );
		const queryStringIndex = url.indexOf( '?' );
		if ( queryStringIndex !== -1 ) {
			args = Object.assign( getQueryArgs( url ), args );
			baseUrl = baseUrl = baseUrl.slice( 0, queryStringIndex );
		}
	}

	return baseUrl + '?' + buildQueryString( args ) + fragment;
}


/**
 * Returns the fragment part of the URL.
 *
 * @param {string} url The full URL
 *
 * @example
 * ```ts
 * const fragment1 = getFragment( 'http://localhost:8080/this/is/a/test?query=true#fragment' ); // '#fragment'
 * const fragment2 = getFragment( 'https://wordpress.org#another-fragment?query=true' ); // '#another-fragment'
 * ```
 *
 * @return {string|void} The fragment part of the URL.
 */
export function getFragment( url: string ): string | undefined {
	const matches: RegExpExecArray | null = /^\S+?(#[^\s?]*)/.exec( url );
	if ( null !== matches && matches.length > 1 ) {
		return matches[ 1 ];
	}
	return undefined;
}

/**
 * Generates URL-encoded query string using input query data.
 *
 * It is intended to behave equivalent as PHP's `http_build_query`, configured
 * with encoding type PHP_QUERY_RFC3986 (spaces as `%20`).
 *
 * @example
 * ```ts
 * const queryString = buildQueryString( {
 *    simple: 'is ok',
 *    arrays: [ 'are', 'fine', 'too' ],
 *    objects: {
 *       evenNested: {
 *          ok: 'yes',
 *       },
 *    },
 * } );
 * // "simple=is%20ok&arrays%5B0%5D=are&arrays%5B1%5D=fine&arrays%5B2%5D=too&objects%5BevenNested%5D%5Bok%5D=yes"
 * ```
 */
export function buildQueryString( data: QueryArgObject ): string {
	let string = '';

	const stack = Object.entries( data );

	let pair;
	while ( ( pair = stack.shift() ) ) {
		let [ key, value ] = pair;
		if ( null !== value && ( 'object' === typeof value || Array.isArray( value ) ) ) {
			const valuePairs = Object.entries( value ).reverse() as [ string, QueryArgParsed ][];
			for ( const [ member, memberValue ] of valuePairs ) {
				stack.unshift( [ `${key}[${member}]`, memberValue ] );
			}
		} else if ( value !== undefined ) {
			if ( null === value ) {
				value = '';
			}
			string += '&' + [ key, value ].map( encodeURIComponent ).join( '=' );
		}
	}
	return string.slice( 1 );
}


/**
 * Sets a value in an object deeply by a given array of path segments. Mutates the
 * object reference.
 *
 * @param {Record<string,*>} object Object in which to assign.
 * @param {string[]}         path   Path segment at which to set value.
 * @param {*}                value  Value to set.
 */
function setPath( object: Record<string, any>, path: string[], value: QueryArgParsed ) { // eslint-disable-line @typescript-eslint/no-explicit-any
	const length = path.length;
	const lastIndex = length - 1;
	for ( let i = 0; i < length; i++ ) {
		let key = path[ i ];
		if ( '' === key && Array.isArray( object ) ) {
			key = object.length.toString();
		}
		key = [ '__proto__', 'constructor', 'prototype' ].includes( key )
			? key.toUpperCase()
			: key;
		const isNextKeyArrayIndex = ! isNaN( Number( path[ i + 1 ] ) );
		if ( i === lastIndex ) {
			object[ key ] = value;
		} else if ( undefined === object[ key ] ) {
			object[ key ] = isNextKeyArrayIndex ? [] : {};
		}
		if ( Array.isArray( object[ key ] ) && ! isNextKeyArrayIndex ) {
			object[ key ] = {...object[ key ]};
		}
		object = object[ key ];
	}
}
