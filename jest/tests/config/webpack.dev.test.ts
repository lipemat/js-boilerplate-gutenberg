import {getConfig} from '@lipemat/js-boilerplate/helpers/config.js';
import webpackDev, {type WebpackConfig} from '../../../config/webpack.dev.js';

const BASE = {
	plugins: [],
	module: {
		rules: [ {
			test: /\.pcss$/,
			use: [],
		} ],
	},

// eslint-disable-next-line @typescript-eslint/no-restricted-types
} as unknown as WebpackConfig;

describe( 'webpack.dev config', () => {
	it( 'should have externals', () => {
		const config = webpackDev( {...BASE} );
		expect( config.externals ).toBeDefined();
	} );


	it( 'should have plugins', () => {
		const config = webpackDev( {...BASE} );
		expect( config.plugins?.length ).toBeGreaterThan( 0 );
	} );


	it( 'should have rules', () => {
		const config = webpackDev( {...BASE} );
		// @ts-expect-error could be partial
		expect( config.module.rules[ 0 ].use.length ).toBeGreaterThan( 0 );
	} );


	it( 'Does not change', async () => {
		const config = await getConfig( 'webpack.dev.js' );
		expect( config ).toMatchSnapshot();
	} );
} );
