/**
 * Given a string, returns a new string with dash separators converted to
 * camel-case equivalent. This is not as aggressive as `_.camelCase`,
 * which would also upper-case letters following numbers.
 *
 * @param {string} string Input dash-delimited string.
 *
 * @return {string} Camel-cased string.
 */
const camelCaseDash = string => string.replace( /-([a-z])/g, ( match, letter ) => letter.toUpperCase() );

/**
 * Convert all wp libraries to the global variable, which are
 * available in WP core when the corresponding libraries are cued.
 *
 * @type {{wpExternals: *}}
 */
module.exports = [
	'a11y',
	'annotations',
	'api-fetch',
	'autop',
	'blob',
	'block-directory',
	'block-editor',
	'block-library',
	'block-serialization-default-parser',
	'blocks',
	'commands',
	'components',
	'compose',
	'core-data',
	'data',
	'data-controls',
	'date',
	'deprecated',
	'dom',
	'dom-ready',
	'edit-post',
	'edit-site',
	'editor',
	'element',
	'escape-html',
	'hooks',
	'html-entities',
	'i18n',
	'is-shallow-equal',
	'keyboard-shortcuts',
	'keycodes',
	'list-reusable-blocks',
	'media-utils',
	'notices',
	'nux',
	'plugins',
	'primitives',
	'priority-queue',
	'redux-routine',
	'reusable-blocks',
	'rich-text',
	'server-side-render',
	'shortcode',
	'token-list',
	'url',
	'utils',
	'viewport',
	'warning',
	'wordcount',
].reduce(
	( externals, name ) => ( {
		...externals,
		[ `@wordpress/${name}` ]: `window.wp?.${camelCaseDash( name )}`,
	} ),
	{
		lodash: 'lodash',
		wp: 'wp',
		react: 'React',
		'react-dom': 'ReactDOM',
		/**
		 * To allow React Fast Refresh (HMR) to work in WP 6.0+ we must
		 * externalize fast refresh or dequeue `wp-react-refresh-runtime`.
		 *
		 * @see \wp_register_development_scripts
		 */
		'react-refresh/runtime': 'ReactRefreshRuntime',
	},
);
