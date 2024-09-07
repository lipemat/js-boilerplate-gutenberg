import type {Middleware} from '@wordpress/api-fetch';

const middlewares: Middleware<any>[] = [];

/**
 * Add a middleware to be called right before the request fires.
 * Middlewares are chained with new ones being called last.
 *
 * Similar to `apiFetch.use` with the main difference being the order
 * they are called.
 *
 * @param  middleware
 *
 * @return {number} index of middleware
 */
export function addMiddleware<D>( middleware: Middleware<D> ): number {
	middlewares.push( middleware );
	return middlewares.length - 1;
}

/**
 * Remove a particular middleware from the cue.
 *
 * @param  index
 */
export function removeMiddleware( index: number ): Middleware<any>[] {
	delete middlewares[ index ];
	return middlewares;
}

export function clearAllMiddleware(): void {
	middlewares.length = 0;
}

export function getAllMiddleware(): Middleware<any>[] {
	return middlewares;
}
