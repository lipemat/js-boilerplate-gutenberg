/**
 * Dynamically locate, load & register all Editor Blocks & Plugins.
 * Supports HOT Module Reloading.
 *
 * Given a path and a entry point's file name, this will automatically
 * load the module and support HMR within Gutenberg.
 *
 * Your module's entry point must export a `name` and a `settings` constant
 * which will be used to either `registerBlockType` or `registerPlugin`.
 *
 * You may export an optional `exclude` const to dynamical exclude a block/plugin
 * from particular context.
 *
 * @see PluginModule
 *
 * @example
 *
 * ```js
 * export default () => {
 *	// Load all blocks
 *	autoloadBlocks( () => require.context( './blocks', true, /block\.tsx$/ ), module );
 *  // Load all meta boxes
 *  autoloadPlugins( () => require.context( './meta-boxes', true, /index\.tsx$/ ), module );
 *	};
 * ```
 *
 * @link https://github.com/kadamwhite/wp-block-hmr-demo
 * @link https://www.npmjs.com/package/@blockhandbook/block-hot-loader
 *
 */
import {BlockSettings, registerBlockType, unregisterBlockType} from '@wordpress/blocks';
import {PluginSettings, registerPlugin, unregisterPlugin} from '@wordpress/plugins';
import {dispatch, select} from '@wordpress/data';

/**
 * Block or plugin modules must export
 * the following properties.
 *
 * name = Name of plugin or block (id format).
 * settings = Either a plugin or block's settings.
 * exclude = Exclude plugin or block from the current context.
 *
 */
export type PluginModule<T = BlockSettings<object> | PluginSettings> = {
	name: string;
	settings: T;
	exclude?: boolean;
}

/**
 * Autoload blocks and add HMR support to them.
 *
 * @example autoloadBlocks( () => require.context( './blocks', true, /block\.tsx$/ ), module );
 *
 * @param {Function} getContext   Execute and return a `require.context()` call.
 * @param            pluginModule - Module of the current file from the global {module}.
 */
export const autoloadBlocks = ( getContext: () => __WebpackModuleApi.RequireContext, pluginModule: NodeJS.Module ) => {
	autoload<BlockSettings<object>>( {
		afterReload: refreshAllBlocks,
		beforeReload: storeSelectedBlock,
		getContext,
		pluginModule,
		register: registerBlockType,
		unregister: unregisterBlockType,
		type: 'block',
	} );
};

/**
 * Autoload plugins and add HMR support to them.
 *
 * @example autoloadPlugins( () => require.context( './meta-boxes', true, /index\.tsx$/ ), module );
 *
 * @param {Function} getContext   Execute and return a `require.context()` call.
 * @param            pluginModule - Module of the current file from the global {module}.
 */
export const autoloadPlugins = ( getContext: () => __WebpackModuleApi.RequireContext, pluginModule: NodeJS.Module ) => {
	autoload<PluginSettings>( {
		afterReload: () => {
		},
		beforeReload: () => {
		},
		getContext,
		pluginModule,
		register: registerPlugin,
		unregister: unregisterPlugin,
		type: 'plugin',
	} );
};


type Autoload<T> = {
	afterReload: ( changedNames: string[] ) => void;
	beforeReload: () => void;
	// Execute and return a `require.context()` call
	getContext: () => __WebpackModuleApi.RequireContext;
	// Module of the current file from the global {module}.
	pluginModule: NodeJS.Module;
	register: ( name: string, config: T ) => any;
	unregister: ( name: string ) => any;
	type: string; // Identify the type for caching purposes.
}

/**
 * Require a set of modules and configure them for hot module replacement.
 *
 * The first argument should be a function returning a `require.context()`
 * call. All modules loaded from this context are cached, and on each rebuild
 * the incoming updated modules are checked against the cache. Updated modules
 * which already exist in the cache are unregistered with the provided function,
 * then any incoming (new or updated) modules will be registered.
 */
export const autoload = <T>( {
	afterReload,
	beforeReload,
	getContext,
	pluginModule,
	register,
	unregister,
	type,
}: Autoload<T> ) => {
	const cache = {};

	const loadModules = () => {
		beforeReload();

		const context = getContext();
		if ( ! context ) {
			return;
		}
		const changedNames: string[] = [];
		context.keys().forEach( key => {
			const requiredModule: PluginModule<T> = context( key );
			// Module is excluded from the current context.
			if ( requiredModule.exclude ) {
				return;
			}
			if ( requiredModule === cache[ key ] ) {
				// Module unchanged: no further action needed.
				return;
			}
			if ( cache[ `${requiredModule.name}-${type}` ] ) {
				// Module changed, and prior copy detected: unregister old module.
				unregister( requiredModule.name );
			}

			// Register new module and update cache.
			register( requiredModule.name, requiredModule.settings );

			changedNames.push( requiredModule.name );
			cache[ `${requiredModule.name}-${type}` ] = requiredModule;
		} );

		afterReload( changedNames );

		// Return the context for HMR initialization.
		return context;
	};

	const context = loadModules();

	if ( pluginModule.hot && context?.id ) {
		pluginModule.hot.accept( context.id, loadModules );
	}
};

// Maintain the selected block ID across HMR updates.
let selectedBlockId: string | null = null;

/**
 * Track the currently selected block and clear its selection.
 *
 * Allows us to reselect the previously selected block after
 * we've replaced the block with our HMR changed one.
 */
const storeSelectedBlock = () => {
	selectedBlockId = select( 'core/block-editor' ).getSelectedBlockClientId();
	dispatch( 'core/block-editor' ).clearSelectedBlock();
};

/**
 * Select each block one at a time to refresh all the blocks
 * on the page.
 *
 * When finished select the originally selected block before we
 * fired the HMR update.
 *
 * @param  changedNames
 */
const refreshAllBlocks = ( changedNames: string[] = [] ) => {
	// Refresh all blocks by iteratively selecting each one.
	select( 'core/block-editor' ).getBlocks().forEach( ( {name, clientId} ) => {
		if ( changedNames.includes( name ) ) {
			dispatch( 'core/block-editor' ).selectBlock( clientId );
		}
	} );
	// Reselect whatever was selected in the beginning.
	if ( selectedBlockId ) {
		dispatch( 'core/block-editor' ).selectBlock( selectedBlockId );
	} else {
		dispatch( 'core/block-editor' ).clearSelectedBlock();
	}
	selectedBlockId = null;
};
