declare module '@wordpress/api-fetch' {
	import {method} from '@wordpress/api';

	export type Middleware<D> = ( options: FetchOptions<D>, next: Middleware<D> ) => Middleware<D>;

	export interface NonceMiddleware {
		( options, next ): Middleware<{ headers: object }>;
		nonce: string;
	}

	/**
	 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/
	 */
	interface FetchOptions<D> extends RequestInit {
		data?: D;
		method: method;
		parse?: boolean;
		path: string;
		url?: string;
	}

	interface ApiFetch {
		<T, D = {}>( options: FetchOptions<D> ): Promise<T>;
		createNonceMiddleware: <D>( nonce: string ) => NonceMiddleware;
		createRootURLMiddleware: <D>( URL: string ) => Middleware<D>;
		nonceEndpoint?: string;
		nonceMiddleware?: NonceMiddleware;
		setFetchHandler: <D>( options: D ) => Promise<Response>;
		use: <D>( middleware: Middleware<D> ) => void;
	}


	const apiFetch: ApiFetch;

	export default apiFetch;
}
