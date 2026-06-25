/**
 * Importing this package must not eagerly load the `@wordpress/*` packages.
 *
 * Consumers who never call an autoload function should be able to use the
 * package without installing `@wordpress/blocks`, `@wordpress/plugins`,
 * `@wordpress/data`, or `@wordpress/rich-text`.
 */

function makeContext(): __WebpackModuleApi.RequireContext {
	const context = ( () => ( {name: 'test/block', settings: {}} ) ) as unknown as __WebpackModuleApi.RequireContext;
	context.keys = () => [ './block.tsx' ];
	context.id = './blocks';
	return context;
}

describe( 'autoload lazy @wordpress loading', () => {
	beforeEach( () => {
		jest.resetModules();
	} );

	afterEach( () => {
		jest.dontMock( '@wordpress/blocks' );
		jest.dontMock( '@wordpress/plugins' );
		jest.dontMock( '@wordpress/data' );
		jest.dontMock( '@wordpress/rich-text' );
	} );

	it( 'does not load any @wordpress package when the module is imported', async () => {
		const loaded = {blocks: false, plugins: false, data: false, richText: false};
		jest.doMock( '@wordpress/blocks', () => {
			loaded.blocks = true;
			return {registerBlockType: jest.fn(), unregisterBlockType: jest.fn()};
		} );
		jest.doMock( '@wordpress/plugins', () => {
			loaded.plugins = true;
			return {registerPlugin: jest.fn(), unregisterPlugin: jest.fn()};
		} );
		jest.doMock( '@wordpress/data', () => {
			loaded.data = true;
			return {dispatch: jest.fn(), select: jest.fn()};
		} );
		jest.doMock( '@wordpress/rich-text', () => {
			loaded.richText = true;
			return {registerFormatType: jest.fn(), unregisterFormatType: jest.fn()};
		} );

		await import( '../../../src/util/autoload' );

		expect( loaded ).toEqual( {blocks: false, plugins: false, data: false, richText: false} );
	} );

	it( 'does not load the autoload @wordpress packages when the package barrel is imported', async () => {
		const loaded = {blocks: false, plugins: false, richText: false};
		jest.doMock( '@wordpress/blocks', () => {
			loaded.blocks = true;
			return {registerBlockType: jest.fn(), unregisterBlockType: jest.fn()};
		} );
		jest.doMock( '@wordpress/plugins', () => {
			loaded.plugins = true;
			return {registerPlugin: jest.fn(), unregisterPlugin: jest.fn()};
		} );
		jest.doMock( '@wordpress/rich-text', () => {
			loaded.richText = true;
			return {registerFormatType: jest.fn(), unregisterFormatType: jest.fn()};
		} );

		await import( '../../../src/index' );

		expect( loaded ).toEqual( {blocks: false, plugins: false, richText: false} );
	} );

	it( 'loads @wordpress/blocks and @wordpress/data only when autoloadBlocks is called', async () => {
		const registerBlockType = jest.fn();
		let blocksLoaded = false;
		let dataLoaded = false;
		jest.doMock( '@wordpress/blocks', () => {
			blocksLoaded = true;
			return {registerBlockType, unregisterBlockType: jest.fn()};
		} );
		jest.doMock( '@wordpress/data', () => {
			dataLoaded = true;
			return {
				dispatch: jest.fn( () => ( {
					clearSelectedBlock: jest.fn( () => Promise.resolve() ),
					selectBlock: jest.fn( () => Promise.resolve() ),
				} ) ),
				select: jest.fn( () => ( {
					getSelectedBlockClientId: () => null,
					getBlocks: () => [],
				} ) ),
			};
		} );

		const {autoloadBlocks} = await import( '../../../src/util/autoload' );

		expect( blocksLoaded ).toBe( false );
		expect( dataLoaded ).toBe( false );

		autoloadBlocks( makeContext, module );

		await new Promise( resolve => setTimeout( resolve, 0 ) );

		expect( blocksLoaded ).toBe( true );
		expect( dataLoaded ).toBe( true );
		expect( registerBlockType ).toHaveBeenCalledWith( 'test/block', {} );
	} );
} );
