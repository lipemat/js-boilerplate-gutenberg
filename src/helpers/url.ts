export type QueryArgs = { [ name: string ]: string | number | QueryArgs };

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
