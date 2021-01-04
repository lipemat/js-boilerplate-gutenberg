import {addMiddleware, removeMiddleware} from '../../../src';
import {createRunStep} from '../../../src/util/request-handler';
import {clearAllMiddleware, getAllMiddleware} from '../../../src/util/middleware';

describe( 'Testing middleware', () => {

	it( 'Test middleware ordering', () => {
		clearAllMiddleware();
		const first = addMiddleware( ( o, n ) => n( 'first' ) );
		const second = addMiddleware( ( o, n ) => n( 'second' ) );
		const third = addMiddleware( ( o, n ) => n( 'third' ) );

		expect( first ).toBe( 0 );
		expect( second ).toBe( 1 );
		expect( third ).toBe( 2 );

		removeMiddleware( second );
		expect( addMiddleware( ( o, n ) => n( 'fourth' ) ) ).toBe( 3 );
		expect( getAllMiddleware().length ).toBe( 4 );
		expect( createRunStep( 0, getAllMiddleware().filter( Boolean ) )( {} ) ).toBe( 'fourth' );
		removeMiddleware( 3 );
		removeMiddleware( 0 );
		expect( createRunStep( 0, getAllMiddleware().filter( Boolean ) )( {} ) ).toBe( 'third' );
		clearAllMiddleware();
	} );

} );
