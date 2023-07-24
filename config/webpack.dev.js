const wpExternals = require( '../helpers/wp-externals' );
const iframeLoader = require( '../helpers/iframe-loader' );
const ReactRefreshFix = require( '../helpers/ReactRefreshFix' );

module.exports = function( config ) {
	/**
	 * Prevent errors with React Refresh when React is not used.
	 */
	config.plugins.push( new ReactRefreshFix() );

	/**
	 * Change the loader to our custom loader
	 * for the `/\.pcss$/` rule.
	 */
	config.module.rules.forEach( rule => {
		if ( rule.test.test( '.pcss' ) ) {
			rule.use[ 0 ] = iframeLoader;
		}
	} );

	return {
		// Add the global `wp` variable based externals.
		externals: {...config.externals, ...wpExternals},
	};
};
