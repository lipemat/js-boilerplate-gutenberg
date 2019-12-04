declare module '@wordpress/api-fetch' {

	type apiFetch = <T>( options: {
		Accept?: string;
		credentials?: 'include' | false
		path: string;
	} ) => Promise<T>;

	export const apiFetch: apiFetch;

	export default apiFetch;
}
