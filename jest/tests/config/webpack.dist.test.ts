import {getConfig} from '@lipemat/js-boilerplate/helpers/config';


describe( 'webpack.dist config', () => {
	it( 'should have externals', () => {
		const config = require( '../../../config/webpack.dist' )( {} );
		expect( config.externals ).toBeDefined();
	} );


	it( 'Does not change', () => {
		expect( getConfig( 'webpack.dist.js' ) ).toMatchSnapshot();
	} );
} );
