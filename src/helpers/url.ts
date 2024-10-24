export type QueryArgs = { [ name: string ]: string | number };

export function getQueryArg( url: string, parameter: string ): string {
	const urlParams = safeUrl( url ).searchParams;
	if ( urlParams.has( parameter ) ) {
		return urlParams.get( parameter )?.toString() ?? '';
	}
	return '';
}


export function addQueryArgs( url: string = '', args: QueryArgs ) {
	const path: URL = safeUrl( url );
	Object.keys( args ).forEach( arg => {
		if ( path.searchParams.has( arg ) ) {
			path.searchParams.delete( arg );
		}
		path.searchParams.append( sanitize( arg ), args[ arg ].toString() );
	} );

	return url.startsWith( 'http://' ) || url.startsWith( 'https://' ) ? path.toString() : path.pathname + path.search;
}

/**
 * Adds a trailing slash to a URL if it doesn't already have one.
 */
export function addTrailingSlash( url: string ): string {
	const trimmedURL = url.trim();
	if ( '' === trimmedURL ) {
		return url;
	}
	return url.replace( /\/?$/, '/' );
}

/**
 * Adds a leading slash to a URL if it doesn't already have one.
 */
export function addLeadingSlash( url: string ): string {
	const trimmedURL = url.trim();
	if ( '' === trimmedURL ) {
		return url;
	}
	return url.replace( /^\/?/, '/' );
}

/**
 * Removes a leading slash from a URL if it has one.
 */
export function removeLeadingSlash( url: string ): string {
	const trimmedURL = url.trim();
	if ( '' === trimmedURL ) {
		return url;
	}
	return url.replace( /^\//, '' );
}


/**
 * Retrieve a URL object from either a full URL or a path.
 */
export function safeUrl( url: string ): URL {
	if ( url.startsWith( 'http://' ) || url.startsWith( 'https://' ) ) {
		return new URL( url );
	}
	return new URL( window.location.origin + url );
}

/**
 * Remove all characters except for letters, numbers, and . / - _
 *
 * A lightweight version of dompurify.sanitize().
 */
function sanitize( str: string ): string {
	return str.replace( /[^a-zA-Z0-9.:\/-_]/g, '' );
}
