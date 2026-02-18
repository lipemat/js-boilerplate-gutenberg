import {getConfig} from '@lipemat/js-boilerplate/helpers/config.js';
// @ts-expect-error Does not have types.
import distConfig from '../../../config/webpack.dist';


describe( 'webpack.dist config', () => {
	it( 'should have externals', () => {
		const config = distConfig( {} );
		expect( config.externals ).toBeDefined();
	} );


	it( 'Does not change', async () => {
		const config = await getConfig( 'webpack.dist.js' );
		expect( config ).toMatchSnapshot();
	} );
} );
