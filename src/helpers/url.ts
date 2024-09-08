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
 * Retrieve a URL object from either a full URL or a path.
 */
function safeUrl( url: string ): URL {
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
