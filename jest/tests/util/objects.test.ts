import {entriesOf, keysOf} from '../../../src/index';

describe( 'keysOf', () => {
	it( 'should return an array of object keys with type inference', () => {
		const obj = {a: 1, b: 2, c: 3};
		const result = keysOf( obj );
		expect( result ).toEqual( [ 'a', 'b', 'c' ] );
		expect( result ).toBeInstanceOf( Array );
	} );


	it( 'should return an empty array for an empty object', () => {
		const obj = {};
		const result = keysOf( obj );
		expect( result ).toEqual( [] );
		expect( result ).toBeInstanceOf( Array );
	} );


	it( 'should work with objects having symbol keys', () => {
		const sym = Symbol( 'key' );
		const obj = {[ sym ]: 'value', a: 1};
		const result = keysOf( obj );
		expect( result ).toEqual( [ 'a' ] ); // Symbol keys are not included by Object.keys()
	} );


	it( 'should infer keys of a record type correctly', () => {
		const obj: Record<'x' | 'y', number> = {x: 10, y: 20};
		const result = keysOf( obj );
		expect( result ).toEqual( [ 'x', 'y' ] );
	} );


	it( 'should return only enumerable properties of the object', () => {
		const obj = Object.create( {}, {
			a: {value: 1, enumerable: true},
			b: {value: 2, enumerable: false},
		} );
		const result = keysOf( obj );
		expect( result ).toEqual( [ 'a' ] );
	} );
} );


describe( 'entriesOf', () => {
	it( 'should return an array of object entries with type inference', () => {
		const obj = {a: 1, b: 2, c: 3};
		const result = entriesOf( obj );
		expect( result ).toEqual( [ [ 'a', 1 ], [ 'b', 2 ], [ 'c', 3 ] ] );
		expect( result ).toBeInstanceOf( Array );
	} );


	it( 'should return an empty array for an empty object', () => {
		const obj = {};
		const result = entriesOf( obj );
		expect( result ).toEqual( [] );
		expect( result ).toBeInstanceOf( Array );
	} );


	it( 'should work with objects having symbol keys', () => {
		const sym = Symbol( 'key' );
		const obj = {[ sym ]: 'value', a: 1};
		const result = entriesOf( obj );
		expect( result ).toEqual( [ [ 'a', 1 ] ] );
	} );


	it( 'should infer entries of a record type correctly', () => {
		const obj: Record<'x' | 'y', number> = {x: 10, y: 20};
		const result = entriesOf( obj );
		expect( result ).toEqual( [ [ 'x', 10 ], [ 'y', 20 ] ] );
	} );


	it( 'should return only enumerable properties of the object', () => {
		const obj = Object.create( {}, {
			a: {value: 1, enumerable: true},
			b: {value: 2, enumerable: false},
		} );
		const result = entriesOf( obj );
		expect( result ).toEqual( [ [ 'a', 1 ] ] );
	} );
} );
