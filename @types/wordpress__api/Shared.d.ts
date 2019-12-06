declare module '@wordpress/api/shared' {
	export interface Collection {
		href: string;
	}

	export interface Links {
		self: Collection[];
		collection: Collection[];
	}
}
