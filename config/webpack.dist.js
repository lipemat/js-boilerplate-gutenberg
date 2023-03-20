const wpExternals = require( '../helpers/wp-externals' );

/**
 * For `dist` all we need to do is add the WP externals.
 */
module.exports = function( config ) {
	return {
		externals: {...config.externals, ...wpExternals},
	};
};
