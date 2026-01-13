const wpExternals = require( '@lipemat/js-boilerplate-shared/helpers/wp-externals.js' );

/**
 * For `dist` all we need to do is add the WP externals.
 */
module.exports = function( config ) {
	return {
		externals: {...config.externals, ...wpExternals.default},
	};
};
