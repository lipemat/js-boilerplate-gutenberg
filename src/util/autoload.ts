/**
 * Dynamically locate, load, and register all Editor Blocks & Plugins.
 * Supports HOT Module Reloading.
 *
 * Given a path and an entry point's file name, this will automatically
 * load the module and support HMR within Gutenberg.
 *
 * Your module's entry point must export a `name` and a `settings` constant
 * which will be used to either `registerBlockType` or `registerPlugin`.
 *
 * You may export an optional `exclude` const to dynamically exclude a block/plugin
 * from a particular context.
 *
 * @see PluginModule
 *
 * @example
 *
 * ```js
 * export default () => {
 *	    // Load all blocks.
 *	    autoloadBlocks(() => require.context('./blocks', true, /block\.tsx$/), module);
 *      // Load all meta boxes.
 *      autoloadPlugins(() => require.context('./meta-boxes', true, /index\.tsx$/), module);
 *      // Load all formats.
 *      autoloadFormats(() => require.context('./formats', true, /index\.tsx$/), module);
 *	};
 * ```
 *
 * @link https://github.com/kadamwhite/wp-block-hmr-demo
 * @link https://www.npmjs.com/package/@blockhandbook/block-hot-loader
 */
import type {BlockSettings, CreateBlock} from '@wordpress/blocks';
import type {PluginSettings} from '@wordpress/plugins';
import type {WPFormat} from '@wordpress/rich-text';

type WPDataDispatch = typeof import( '@wordpress/data' )['dispatch'];
type WPDataSelect = typeof import( '@wordpress/data' )['select'];


/**
 * Block or plugin modules must export
 * the following properties.
 *
 * name = Name of plugin or block (id format).
 * settings = Either a plugin or block's settings.
 * exclude = Exclude a plugin or block from the current context.
 *
 */
export type PluginModule<T = BlockSettings<object> | PluginSettings | WPFormat> = {
	name: string;
	settings: T;
	exclude?: boolean;
}

/**
 * Autoload blocks and add HMR support to them.
 *
 * @example autoloadBlocks(() => require.context('./blocks', true, /block\.tsx$/), module);
 *
 * @param {Function} getContext   Execute and return a `require.context()` call.
 * @param            pluginModule - Module of the current file from the global {module}.
 */
export const autoloadBlocks = ( getContext: () => __WebpackModuleApi.RequireContext, pluginModule: NodeJS.Module ): void => {
	void ( async () => {
		const [ {registerBlockType, unregisterBlockType}, {
			dispatch,
			select,
		} ] = await Promise.all( [
			import( '@wordpress/blocks' ),
			import( '@wordpress/data' ),
		] );
		autoload<BlockSettings<object>>( {
			afterReload: changedNames => refreshAllBlocks( dispatch, select, changedNames ),
			beforeReload: () => storeSelectedBlock( select ),
			getContext,
			pluginModule,
			register: registerBlockType,
			unregister: unregisterBlockType,
			type: 'block',
		} );
	} )();
};

/**
 * Autoload plugins and add HMR support to them.
 *
 * @example autoloadPlugins(() => require.context('./meta-boxes', true, /index\.tsx$/), module);
 *
 * @param {Function} getContext   Execute and return a `require.context()` call.
 * @param            pluginModule - Module of the current file from the global {module}.
 */
export const autoloadPlugins = ( getContext: () => __WebpackModuleApi.RequireContext, pluginModule: NodeJS.Module ): void => {
	void ( async () => {
		const {registerPlugin, unregisterPlugin} = await import( '@wordpress/plugins' );
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
	} )();
};

/**
 * Autoload formats and add HMR support to them.
 *
 * @example autoloadFormats(() => require.context('./formats', true, /index\.tsx$/), module);
 *
 * @param getContext
 * @param pluginModule
 */
export const autoloadFormats = ( getContext: () => __WebpackModuleApi.RequireContext, pluginModule: NodeJS.Module ): void => {
	void ( async () => {
		const {registerFormatType, unregisterFormatType} = await import( '@wordpress/rich-text' );
		autoload<WPFormat>( {
			afterReload: () => {
			},
			beforeReload: () => {
			},
			getContext,
			pluginModule,
			register: registerFormatType,
			unregister: unregisterFormatType,
			type: 'format',
		} );
	} )();
};


type Autoload<T> = {
	afterReload: ( changedNames: string[] ) => void;
	beforeReload: () => void;
	// Execute and return a `require.context()` call
	getContext: () => __WebpackModuleApi.RequireContext | undefined;
	// Module of the current file from the global {module}.
	pluginModule: NodeJS.Module;
	register: ( name: string, config: T ) => object | undefined | void;
	unregister: ( name: string ) => object | undefined | void;
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
export const autoload = <T extends BlockSettings<object> | PluginSettings | WPFormat>( {
	afterReload,
	beforeReload,
	getContext,
	pluginModule,
	register,
	unregister,
	type,
}: Autoload<T> ) => {
	const cache: { [ key: string ]: PluginModule } = {};

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
			if ( Boolean( requiredModule.exclude ) ) {
				return;
			}
			if ( requiredModule === cache[ key ] ) {
				// Module unchanged: no further action needed.
				return;
			}
			if ( Boolean( cache[ `${requiredModule.name}-${type}` ] ) ) {
				// Module changed, and prior copy detected: unregister the old module.
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

	if ( pluginModule.hot && 'undefined' !== typeof context?.id ) {
		pluginModule.hot.accept( context.id.toString(), loadModules );
	}
};

// Maintain the selected block ID across HMR updates.
let selectedBlockId: string | null = null;
// Generate list of all blocks, which much be touched.
let refreshClientIds: string[] = [];

/**
 * Track the currently selected block and clear its selection.
 *
 * Allows us to reselect the previously selected block after
 * we've replaced the block with our HMR changed one.
 */
const storeSelectedBlock = ( select: WPDataSelect ) => {
	selectedBlockId = select( 'core/block-editor' ).getSelectedBlockClientId();
};

/**
 * Recursively find all blocks which match the changed block names, so
 * we can touch each one.
 *
 */
const retrieveBlocksToRefresh = ( changedNames: string[] = [], block: CreateBlock ) => {
	const {name, clientId, innerBlocks} = block;
	if ( changedNames.includes( name ) ) {
		refreshClientIds.push( clientId );
	}
	innerBlocks.forEach( childBlock => retrieveBlocksToRefresh( changedNames, childBlock ) );
};

/**
 * 1. Select each block one at a time to refresh all the blocks
 * on the page.
 * 2. Select the previously selected block before the HMR update.
 *
 */
const refreshAllBlocks = async ( dispatch: WPDataDispatch, select: WPDataSelect, changedNames: string[] = [] ) => {
	await dispatch( 'core/block-editor' ).clearSelectedBlock();
	// Refresh all blocks by iteratively selecting each one.
	select( 'core/block-editor' ).getBlocks().forEach( block => retrieveBlocksToRefresh( changedNames, block ) );
	for ( let i = 0; i < refreshClientIds.length; i++ ) {
		await dispatch( 'core/block-editor' ).selectBlock( refreshClientIds[ i ] );
	}

	// Reselect whatever was selected in the beginning.
	if ( null !== selectedBlockId ) {
		await dispatch( 'core/block-editor' ).selectBlock( selectedBlockId );
	} else {
		await dispatch( 'core/block-editor' ).clearSelectedBlock();
	}
	refreshClientIds = [];
	selectedBlockId = null;
};
