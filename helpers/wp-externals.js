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
	'api-fetch',
	'autop',
	'block-editor',
	'blocks',
	'block-serialization-default-parser',
	'components',
	'compose',
	'core-data',
	'data',
	'date',
	'dom-ready',
	'edit-post',
	'editor',
	'element',
	'hooks',
	'html-entities',
	'i18n',
	'media-utils',
	'plugins',
	'primitives',
	'rich-text',
	'server-side-render',
	'url',
	'utils',
].reduce(
	( externals, name ) => ( {
		...externals,
		[ `@wordpress/${name}` ]: `wp.${camelCaseDash( name )}`,
	} ),
	{
		wp: 'wp',
		/**
		 * We use the core version of React DOM on production builds.
		 * For dev builds we use the @hot-loader/react-dom version.
		 */
		react: 'React',
		lodash: 'lodash',
	},
);
