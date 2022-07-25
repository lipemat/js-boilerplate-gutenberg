const webpackConfig = require( '@lipemat/js-boilerplate/config/webpack.dev' );
const wpExternals = require( '../helpers/wp-externals' );
const externalsDefault = Object.assign( {}, webpackConfig.externals );
const rules = Object.assign( {}, webpackConfig.module.rules );

// @todo Switch to function based return so don't need to require webpack.dev.

/**
 * Gutenberg is loading within FSE and future areas within an iFrame.
 * We must target said iFrame with the generated <style> tags or
 * our styles won't show up in the editor.
 *
 * 1. We must wait for the iframe to load as it's generated via JS.
 *    so we can't simply point `insert` to `[name="editor-canvas"]`.
 * 2. We don't have much to go on except the iframe name :-(.
 */
rules[ 2 ].use[ 0 ] = {
	loader: 'style-loader',
	options: {
		insert: styleTag => {
			setTimeout( () => {
				const gutenbergEditor = document.querySelector( 'iframe[name="editor-canvas"]' );
				if ( gutenbergEditor ) {
					gutenbergEditor.contentDocument.head.appendChild( styleTag );

					// Run the default again once everything is loaded.
					// Fixes emoji script race condition turning the Ⓜ into <img>.
					document.querySelector( 'head' ).appendChild( styleTag );
				}
			}, 2000 );

			// Default behavior.
			document.querySelector( 'head' ).appendChild( styleTag );
		},
	},
};


module.exports = {
	externals: {...externalsDefault, ...wpExternals},
};
