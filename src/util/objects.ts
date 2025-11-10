/**
 * Object.keys() with type inference.
 *
 * Instead of getting `string[]` we get `keyof T[]`.
 *
 * @since 4.3.0
 */
export function keysOf<T extends object>( obj: T ): Array<keyof T> {
	return Object.keys( obj ) as Array<keyof T>;
}


/**
 * Object.entries() with type inference.
 *
 * Instead of getting `Array<[string, any]>` we get `Array<[keyof T, T[keyof T]]>`.
 *
 * @since 4.3.0
 */
export function entriesOf<T extends object>( obj: T ): Array<[ keyof T, T[keyof T] ]> {
	return Object.entries( obj ) as Array<[ keyof T, T[keyof T] ]>;
}
