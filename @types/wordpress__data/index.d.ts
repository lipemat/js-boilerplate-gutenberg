declare module '@wordpress/data' {

	import {ComponentType} from 'react';

	type select = <Result>( store: string ) => {
		[ selector: string ]: ( key?: string ) => Result
	}

	export type useSelect = <T>( callback: ( select: select ) => T, deps?: Array<any> ) => T;
	export type useDispatch = <T>( storeName: string ) => ( newValue: any ) => void;
	export type withDispatch = <T>( callback: ( dispatch: any, ownProps: object, {select: select} ) => T, component: ComponentType<T> ) => ComponentType<T>;
	export type withSelect = <T>( callback: ( callback: ( select: select ) => T, ownProps: object ) => T, component: ComponentType<T> ) => ComponentType<T>;

	export const select: select;
	export const useDispatch: useDispatch;
	export const useSelect: useSelect;
	export const withDispatch: withDispatch;
	export const withSelect: withSelect;

	export default interface Data {
		select: select;
		useDispatch: useDispatch;
		useSelect: useSelect;
	}
}
