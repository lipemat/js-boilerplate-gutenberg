const wpExternals = require( '../helpers/wp-externals' );
const iframeLoader = require( '../helpers/iframe-loader' );

module.exports = function( config ) {
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
