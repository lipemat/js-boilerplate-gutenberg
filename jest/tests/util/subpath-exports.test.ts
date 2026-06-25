/**
 * The main package barrel must not pull in any `@wordpress/*` package.
 *
 * WordPress-dependent code lives behind dedicated subpath exports:
 * - `@lipemat/js-boilerplate-gutenberg/autoload` (blocks, plugins, data, rich-text)
 * - `@lipemat/js-boilerplate-gutenberg/hooks` (data)
 *
 * Consumers who only use the framework-agnostic API (wpapi, url, nonce, …)
 * can therefore use the package without installing those `@wordpress/*` packages.
 */

function makeContext(): __WebpackModuleApi.RequireContext {
	const context: __WebpackModuleApi.RequireContext = ( () => ( {
		name: 'test/block',
		settings: {},
	} ) ) as unknown as __WebpackModuleApi.RequireContext;
	context.keys = () => [ './block.tsx' ];
	context.id = './blocks';
	return context;
}

function mockData() {
	return {
		dispatch: jest.fn( () => ( {
			clearSelectedBlock: jest.fn( () => Promise.resolve() ),
			selectBlock: jest.fn( () => Promise.resolve() ),
		} ) ),
		select: jest.fn( () => ( {
			getSelectedBlockClientId: () => null,
			getBlocks: () => [],
		} ) ),
		useDispatch: jest.fn(),
		useSelect: jest.fn(),
	};
}

describe( 'subpath exports keep @wordpress optional', () => {
	beforeEach( () => {
		jest.resetModules();
	} );

	afterEach( () => {
		jest.dontMock( '@wordpress/blocks' );
		jest.dontMock( '@wordpress/plugins' );
		jest.dontMock( '@wordpress/data' );
		jest.dontMock( '@wordpress/rich-text' );
	} );

	it( 'does not load any @wordpress package when the main barrel is imported', async () => {
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
			return mockData();
		} );
		jest.doMock( '@wordpress/rich-text', () => {
			loaded.richText = true;
			return {registerFormatType: jest.fn(), unregisterFormatType: jest.fn()};
		} );

		await import( '../../../src/index' );

		expect( loaded ).toEqual( {blocks: false, plugins: false, data: false, richText: false} );
	} );

	it( 'registers blocks synchronously through the /autoload entry', async () => {
		const registerBlockType = jest.fn();
		jest.doMock( '@wordpress/blocks', () => ( {
			registerBlockType,
			unregisterBlockType: jest.fn(),
		} ) );
		jest.doMock( '@wordpress/plugins', () => ( {
			registerPlugin: jest.fn(),
			unregisterPlugin: jest.fn(),
		} ) );
		jest.doMock( '@wordpress/rich-text', () => ( {
			registerFormatType: jest.fn(),
			unregisterFormatType: jest.fn(),
		} ) );
		jest.doMock( '@wordpress/data', () => mockData() );

		const {autoloadBlocks} = await import( '../../../src/autoload' );
		autoloadBlocks( makeContext, module );

		expect( registerBlockType ).toHaveBeenCalledWith( 'test/block', {} );
	} );

	it( 'loads @wordpress/data through the /hooks entry', async () => {
		let dataLoaded = false;
		jest.doMock( '@wordpress/data', () => {
			dataLoaded = true;
			return mockData();
		} );

		await import( '../../../src/hooks' );

		expect( dataLoaded ).toBe( true );
	} );
} );
