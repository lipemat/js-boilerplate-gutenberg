/**
 * Gutenberg is loading within FSE and future areas within an iFrame.
 * We must target said iFrame with the generated <style> tags, or
 * our styles won't show up in the editor.
 *
 * 1. We must wait for the iframe to load as it's generated via JS,
 *    so we can't simply point `insert` to `[name="editor-canvas"]`.
 * 2. Not much to go on except the iframe name :-(.
 */
const iframeLoader = {
	loader: 'style-loader',
	options: {
		attributes: {
			// Add an attribute to the `<style name="style-loader">` to identify it.
			name: 'style-loader',
		},
		styleTagTransform: ( content, el ) => {
			/**
			 * Taken verbatim from style-loader.
			 *
			 * Must live inside this arrow function to be included in
			 * the browser.
			 *
			 * @link https://github.dev/webpack-contrib/style-loader/blob/master/src/runtime/styleTagTransform.js
			 */
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

			function cloneToGutenbergIframe() {
				const gutenbergEditor = document.querySelector( 'iframe[name="editor-canvas"]' );
				if ( null !== gutenbergEditor && gutenbergEditor.contentDocument.head ) {
					if ( gutenbergEditor.contentDocument.head.innerText === '' ) {
						return;
					}
					// Store the cloned style tag on property for reuse.
					el.iframeCloned = el.cloneNode( true );
					gutenbergEditor.contentDocument.head.appendChild( el.iframeCloned );
				}
			}

			// Default transformation of <style> tag on the root document.
			styleTagTransform( content, el );
			// Duplicate style tag on Gutenberg iframe and transform.
			if ( ! el.iframeCloned ) {
				setTimeout( () => {
					cloneToGutenbergIframe();
					// Try again in a few seconds...
					if ( ! el.iframeCloned ) {
						setTimeout( () => {
							cloneToGutenbergIframe();
							if ( ! el.iframeCloned ) {
								// Use `no-iframe-available` to prevent checking for the iframe on every change.
								el.iframeCloned = 'no-iframe-available';
							}
						}, 7000 );
					}
				}, 3000 );

				// Transform the iframe's <style> tag.
			} else if ( el.iframeCloned && 'no-iframe-available' !== el.iframeCloned ) {
				styleTagTransform( content, el.iframeCloned );
			}
		},
	},
};

module.exports = iframeLoader;
