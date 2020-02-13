declare module '@wordpress/api-fetch' {
	/**
	 * @link https://developer.wordpress.org/block-editor/packages/packages-api-fetch/
	 */
	interface FetchOptions<D> extends Omit<Request, 'method'| 'url'> {
		path: string;
		parse?: boolean;
		data?: D;
		url?: string;
		method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';
	}

	type apiFetch = <T, D = {}>( options: FetchOptions<D> ) => Promise<T>;

	export const apiFetch: apiFetch;

	export default apiFetch;
}
