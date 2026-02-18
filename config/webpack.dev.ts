import wpExternals from '@lipemat/js-boilerplate-shared/helpers/wp-externals.js';
// @ts-expect-error Does not have types.
import iframeLoader from '../helpers/iframe-loader.js';
import ReactRefreshFix from '../helpers/ReactRefreshFix.mts';

import {type Configuration, type ExternalItemObjectUnknown, type ModuleOptions, type RuleSetRule, type WebpackPluginInstance} from 'webpack';
import type {AtLeast} from '@lipemat/js-boilerplate-shared/types/utility';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;


type Rule = AtLeast<RuleSetRule, 'use'> & {
	test: RegExp;
};

// @todo Import type from webpack.dist in js-boilerplate.
export type WebpackConfig =
	AtLeast<Omit<Configuration, 'module' | 'externals' | 'plugins'>, 'entry' | 'output'>
	& {
	externals: ExternalItemObjectUnknown;
	module: Omit<ModuleOptions, 'rules'> & {
		rules: [ Optional<Rule, 'use'>, Rule, Rule ];
	};
	plugins: WebpackPluginInstance[];
};


export default function( config: WebpackConfig ): Partial<WebpackConfig> {
	/**
	 * Prevent errors with React Refresh when React is not used.
	 */
	config.plugins.push( new ReactRefreshFix() );

	/**
	 * Change the loader to our custom loader
	 * for the `/\.pcss$/` rule.
	 */
	config.module.rules.forEach( rule => {
		if ( undefined !== rule.test && rule.test.test( '.pcss' ) && undefined !== rule.use && Array.isArray( rule.use ) ) {
			rule.use[ 0 ] = iframeLoader;
		}
	} );

	return {
		// Add the global `wp` variable based externals.
		externals: {...config.externals, ...wpExternals},
		plugins: config.plugins,
		module: config.module,
	};
}
