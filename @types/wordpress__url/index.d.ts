declare module '@wordpress/url' {
	type addQueryArgs = ( url: string, args: { [ key: string ]: any } ) => string;

	export const addQueryArgs: addQueryArgs;

	export default interface URL {
		addQueryArgs: addQueryArgs;
	}
}
