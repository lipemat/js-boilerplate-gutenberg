const webpackConfig = require( '@lipemat/js-boilerplate/config/webpack.dev' );
const wpExternals = require( '../helpers/wp-externals' );
const externalsDefault = Object.assign( {}, webpackConfig.externals );
const rules = Object.assign( {}, webpackConfig.module.rules );

// @todo Switch to function based return so don't need to require webpack.dist.

/**
 * Gutenberg is loading within FSE and future areas within an iFrame.
 * We must target said iFrame with the generated <style> tags or
 * our styles won't show up in the editor.
 *
 * 1. We must wait for the iframe to load as it's generated via JS.
 *    so we can't simply point `insert` to `[name="editor-canvas"]`.
 * 2. We don't have much to go on except the iframe name :-(.
 *
 * @notice In order for styles to work in FSE when script debug is off
 *         you must register the style for the block using the CSS handle.
 *         ```php
 *          register_block_type( 'lipe-project/master', [
 *              'editor_style' => self::CSS_HANDLE,
 *          ] );
 *          ```
 *
 * @link https://developer.wordpress.org/block-editor/reference-guides/block-api/block-metadata/#wpdefinedasset
 */
rules[ 2 ].use[ 0 ] = {
	loader: 'style-loader',
	options: {
		attributes: {
			name: 'style-loader',
		},
		styleTagTransform: ( css, styleElement ) => {
			/**
			 * Taken verbatim from style-loader.
			 *
			 * Must live inside this arrow function to be included in
			 * the browser.
			 *
			 * @link https://github.dev/webpack-contrib/style-loader/blob/master/src/runtime/styleTagTransform.js
			 */
			// eslint-disable-next-line no-shadow
			function styleTagTransform( css, styleElement ) {
				if ( styleElement.styleSheet ) {
					styleElement.styleSheet.cssText = css;
				} else {
					while ( styleElement.firstChild ) {
						styleElement.removeChild( styleElement.firstChild );
					}

					styleElement.appendChild( document.createTextNode( css ) );
				}
			}

			// Default transformation of <style> tag on root document.
			styleTagTransform( css, styleElement );

			// Duplicate style tag on Gutenberg iframe and transform.
			if ( ! styleElement.iframeCloned ) {
				setTimeout( () => {
					const gutenbergEditor = document.querySelector( 'iframe[name="editor-canvas"]' );
					if ( gutenbergEditor ) {
						// Store the cloned style tag on property for reuse.
						styleElement.iframeCloned = styleElement.cloneNode( true );
						gutenbergEditor.contentDocument.head.appendChild( styleElement.iframeCloned );
					} else {
						// Use `no-iframe-available` to prevent loops when checking for iframe.
						styleElement.iframeCloned = 'no-iframe-available';
					}
				}, 2000 );
			} else if ( 'no-iframe-available' !== styleElement.iframeCloned ) {
				styleTagTransform( css, styleElement.iframeCloned );
			}
		},
	},
};


module.exports = {
	// Add the global `wp` variable based externals.
	externals: {...externalsDefault, ...wpExternals},
};
