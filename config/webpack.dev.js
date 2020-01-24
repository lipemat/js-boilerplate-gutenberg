const webpackConfig = require( '@lipemat/js-boilerplate/config/webpack.dev' );
const wpExternals = require( '../helpers/wp-externals' );
let externalsDefault = Object.assign( {}, webpackConfig.externals );

module.exports = {
	externals: {...externalsDefault, ...wpExternals},
};
