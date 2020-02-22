declare module '@wordpress/api-fetch' {
	import {method} from '@wordpress/api';

	export type Middleware<D> = ( options: FetchOptions<D>, next: Middleware<D> ) => Middleware<D>;

	/**
	 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/
	 */
	interface FetchOptions<D> extends Partial<Request> {
		path: string;
		parse?: boolean;
		data?: D;
		url?: string;
		method?: method;
	}

	interface ApiFetch<T, D = {}> {
		( options: FetchOptions<D> ): Promise<T>;
		createNonceMiddleware: ( nonce: string ) => Middleware<D>;
		createRootURLMiddleware: ( URL: string ) => Middleware<D>;
		nonceEndpoint: string;
		setFetchHandler: ( options: D ) => Promise<Response>;
		use: ( middleware: Middleware<D> ) => void;
	}

	// @ts-ignore
	const apiFetch: ApiFetch;

	export default apiFetch;
}
