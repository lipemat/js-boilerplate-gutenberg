export function parseUrl( root: string, path: string ): string {
	if ( -1 !== root.indexOf( '?' ) ) {
		path = path.replace( '?', '&' );
	} else if ( '/' === root.substr( root.length - 1 ) ) {
		path = path.replace( /^\//, '' );
	} else if ( '/' !== path[ 0 ] ) {
		path = '/' + path;
	}

	return root + path;
}
