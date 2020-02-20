import {
	Category,
	Comment,
	CommentCreate,
	Media,
	method,
	Post,
	PostsQuery,
	Settings,
	Taxonomy,
	Type,
	User,
	UsersQuery,
	UserUpdate,
} from '@wordpress/api';
import apiFetch from '@wordpress/api-fetch';

export interface CustomResource {
	[ route: string ]: () => Request<any, any, any>;
}

export interface Resources {
	categories: () => Request<Category, any, any>;
	comments: () => Request<Comment, any, CommentCreate>;
	media: () => Request<Media, any, any>;
	statuses: () => Request<any, any, any>;
	pages: () => Request<Post, PostsQuery, any>;
	posts: () => Request<Post, PostsQuery, any>;
	settings: () => Request<Settings, any, any>;
	tags: () => Request<any, any, any>;
	taxonomies: () => Request<Taxonomy, any, any>;
	types: () => Request<Type, any, any>;
	users: () => Request<User, UsersQuery, UserUpdate>;
	search: () => Request<any, any, any>;

	setNonce: ( nonce: string ) => void;
	setRootURL: ( URL: string ) => void;
}

/**
 * T = Object Structure.
 * Q = Query params.
 * U = Update object properties.
 */
export interface Request<T, Q, U> {
	get: ( options?: Q | number ) => Promise<T | T[]>;
	create: ( data: U ) => Promise<T>;
	update: ( data: U ) => Promise<T>;
	delete: ( id: number ) => Promise<T>;
}

/**
 * T = Object Structure.
Q = Query params.
U = Update object properties.
 *
 * @param path
 */
export function createMethods<T, Q, U>( path: string ): Request<T, Q, U> {
	return {
		get: ( data? ) => doRequest<T, Q>( path, 'GET', data as Q ),
		create: ( data ) => doRequest<T, U>( path, 'POST', data ),
		update: ( data ) => doRequest<T, U>( path, 'PATCH', data ),
		delete: ( id ) => doRequest<T, number>( path, 'DELETE', id ),
	};
}

export async function doRequest<T, D>( path: string, requestMethod: method, data: number ): Promise<T>;
export async function doRequest<T, D>( path: string, requestMethod: method, data?: D ): Promise<T>;
export async function doRequest<T, D>( path: string, requestMethod: method, data?: D ): Promise<T | T[]>;
export async function doRequest<T, D>( path: string, requestMethod: method, data?: D | number ) {
	if ( 'number' === typeof data || 'undefined' === typeof data ) {
		if ( 'number' === typeof data ) {
			path += '/' + data;
		}
		return apiFetch<T>( {
			path,
			method: requestMethod,
		} );
	}

	return apiFetch<T, D>( {
		path,
		method: requestMethod,
		data,
	} );
}

export default function wpapi<C extends CustomResource>( customRoutes?: [ { [route in keyof C]: () => Request<any, any, any> } ] ): Resources & C {
	const routes = {
		categories: () => createMethods<Category, any, any>( '/wp/v2/categories' ),
		comments: () => createMethods<Comment, any, CommentCreate>( '/wp/v2/comments' ),
		media: () => createMethods<Media, any, any>( '/wp/v2/media' ),
		statuses: () => createMethods<any, any, any>( '/wp/v2/statuses' ),
		pages: () => createMethods<Post, PostsQuery, any>( '/wp/v2/pages' ),
		posts: () => createMethods<Post, PostsQuery, any>( '/wp/v2/posts' ),
		settings: () => createMethods<Settings, any, any>( '/wp/v2/settings' ),
		tags: () => createMethods<any, any, any>( '/wp/v2/tags' ),
		taxonomies: () => createMethods<Taxonomy, any, any>( '/wp/v2/taxonomies' ),
		types: () => createMethods<Type, any, any>( '/wp/v2/types:' ),
		users: () => createMethods<User, UsersQuery, UserUpdate>( '/wp/v2/users' ),
		search: () => createMethods<any, any, any>( '/wp/v2/search' ),

		// Use another site's nonce.
		setNonce: ( nonce: string ) => apiFetch.use( apiFetch.createNonceMiddleware( nonce ) ),
		// Point to another site's URL.
		setRootURL: ( URL: string ) => apiFetch.use( apiFetch.createRootURLMiddleware( URL ) ),
	};

	if ( typeof customRoutes !== 'undefined' ) {
		Object.keys( customRoutes ).map( ( route ) => {
			routes[ route ] = customRoutes[ route ];
		} );
	}

	return routes as Resources & C;
}
