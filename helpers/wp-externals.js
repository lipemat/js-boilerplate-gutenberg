/**
 * Given a string, returns a new string with dash separators converted to
 * camel-case equivalent. This is not as aggressive as `_.camelCase`, which
 * which would also upper-case letters following numbers.
 *
 * @param {string} string Input dash-delimited string.
 *
 * @return {string} Camel-cased string.
 */
const camelCaseDash = string => string.replace( /-([a-z])/g, ( match, letter ) => letter.toUpperCase() );

/**
 * Convert all wp libraries to the global variable which are
 * available in WP core when the corresponding libraries are cued.
 *
 * @type {{wpExternals: *}}
 */
module.exports = [
	'api-fetch',
	'block-editor',
	'blocks',
	'components',
	'data',
	'date',
	'edit-post',
	'editor',
	'element',
	'hooks',
	'i18n',
	'plugins',
	'url',
	'utils',
].reduce(
	( externals, name ) => ( {
		...externals,
		[ `@wordpress/${name}` ]: `wp.${camelCaseDash( name )}`,
	} ),
	{
		wp: 'wp',
		// We must use the WP Core global React within blocks or hooks will not work.
		react: 'React',
		'lodash': 'lodash',
	},
);

