/**
 * Type declarations for WP Rest Api.
 *
 * @author Mat Lipe
 *
 * @link https://developer.wordpress.org/rest-api/reference/
 *
 */
declare module '@wordpress/api' {
	export * from '@wordpress/api/categories';
	export * from '@wordpress/api/comments';
	export * from '@wordpress/api/media';
	export * from '@wordpress/api/posts';
	export * from '@wordpress/api/settings';
	export * from '@wordpress/api/taxonomies';
	export * from '@wordpress/api/types';
	export * from '@wordpress/api/users';

	export type context = 'view' | 'embed' | 'edit';
	export type order = 'asc' | 'desc';
	export type method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'OPTIONS';

	export interface Collection {
		href: string;
	}

	export interface Links {
		self: Collection[];
		collection: Collection[];
	}
}
