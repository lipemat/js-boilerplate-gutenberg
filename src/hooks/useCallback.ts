// eslint-disable-next-line @typescript-eslint/ban-types -- We don't know the shape of the callback.
type DependencyList = ReadonlyArray<unknown>;

/**
 * Mimics the React `useCallback` hook but does not require React
 * as a dependency.
 *
 * Even though React is loaded on a page where `usePostMeta` or `useTerms` is used, the rest of this package does not need React. Having react as a requirement for any part of this package makes it a requirement for all of it.
 *
 * Internal use only.
 *
 * @since 3.4.0
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- We don't know the shape of the callback.
export function useCallback<T extends( ...args: any[] ) => any>( callback: T, dependencies: DependencyList ): T {
	const callbackRef = {current: callback};
	const dependenciesRef = {current: dependencies};

	const memoizedCallback = ( ...args: Parameters<T> ): ReturnType<T> => {
		return callbackRef.current( ...args );
	};

	const hasChanged = dependencies.some( ( dep, index ) => dep !== dependenciesRef.current[ index ] );
	if ( hasChanged ) {
		callbackRef.current = callback;
		dependenciesRef.current = dependencies;
	}

	return memoizedCallback as T;
}
