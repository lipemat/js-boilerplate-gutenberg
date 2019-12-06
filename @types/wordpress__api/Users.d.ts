declare module '@wordpress/api/users' {
	import {Links} from '@wordpress/api/shared';

	/* eslint camelcase: 0 */

	/**
	 * Users Endpoint.
	 *
	 * @link https://developer.wordpress.org/rest-api/reference/users/
	 */
	export interface User {
		id: number;
		name: string;
		url: string;
		description: string;
		link: string;
		slug: string;
		avatar_urls: { [ key: string ]: string };
		meta: { [ key: string ]: any };
		_links: Links;
	}

	/**
	 * User Update.
	 *
	 * https://developer.wordpress.org/rest-api/reference/users/#arguments-4
	 */
	export interface UserUpdate {
		id: number;
		name?: string;
		first_name?: string;
		last_name?: string;
		email?: string;
		url?: string;
		description?: string;
		locale?: string;
		nickname?: string;
		slug?: string;
		roles?: string[];
		password?: string;
		meta?: { [ key: string ]: any };
	}


	/**
	 * List Users.
	 *
	 * https://developer.wordpress.org/rest-api/reference/users/#arguments
	 */
	export interface UsersQuery {
		context?: 'view' | 'embed' | 'edit';
		page?: number | 1;
		per_page?: number | 10;
		search?: string;
		exclude?: number[];
		include?: number[];
		offset?: number;
		order?: 'asc' | 'desc';
		orderby?: 'id' | 'include' | 'name' | 'registered_date' | 'slug' | 'include_slugs' | 'email' | 'url';
		slug?: string;
		roles?: string[];
		who?: 'authors';
	}
}