import {getConfig} from '@lipemat/js-boilerplate/helpers/config.js';


const BASE = {
	plugins: [],
	module: {
		rules: [ {
			test: /\.pcss$/,
			use: [],
		} ],
	},
};

describe( 'webpack.dev config', () => {
	it( 'should have externals', () => {
		const config = require( '../../../config/webpack.dev' )( {...BASE} );
		expect( config.externals ).toBeDefined();
	} );


	it( 'should have plugins', () => {
		const config = require( '../../../config/webpack.dev' )( {...BASE} );
		expect( config.plugins.length ).toBeGreaterThan( 0 );
	} );


	it( 'should have rules', () => {
		const config = require( '../../../config/webpack.dev' )( {...BASE} );
		expect( config.module.rules[ 0 ].use.length ).toBeGreaterThan( 0 );
	} );


	it( 'Does not change', () => {
		expect( getConfig( 'webpack.dev.js' ) ).toMatchSnapshot();
	} );
} );
