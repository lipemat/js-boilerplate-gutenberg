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

export interface CustomRoutes {
	[ route: string ]: () => RequestMethods<any, any, any>;
}

export interface Routes {
	categories: () => RequestMethods<Category, any, any>;
	comments: () => RequestMethods<Comment, any, CommentCreate>;
	media: () => RequestMethods<Media, any, any>;
	statuses: () => RequestMethods<any, any, any>;
	pages: () => RequestMethods<Post, PostsQuery, any>;
	posts: () => RequestMethods<Post, PostsQuery, any>;
	settings: () => RequestMethods<Settings, any, any>;
	tags: () => RequestMethods<any, any, any>;
	taxonomies: () => RequestMethods<Taxonomy, any, any>;
	types: () => RequestMethods<Type, any, any>;
	users: () => RequestMethods<User, UsersQuery, UserUpdate>;
	search: () => RequestMethods<any, any, any>;

	setNonce: ( nonce: string ) => void;
	setRootURL: ( URL: string ) => void;
}

/**
 * T = Object Structure.
 * Q = Query params.
 * U = Update object properties.
 */
export interface RequestMethods<T, Q, U> {
	get: ( options?: Q ) => Promise<T[]>;
	getOne: ( id: number ) => Promise<T>;
	create: ( data: U ) => Promise<T>;
	update: ( id: number, data: U ) => Promise<T>;
	delete: ( id: number ) => Promise<T>;
}

/**
 * T = Object Structure.
 * Q = Query params.
 * U = Update object properties.
 *
 * @param path
 */
export function createMethods<T, Q, U>( path: string ): RequestMethods<T, Q, U> {
	return {
		get: ( data? ) => doRequest<T[], Q>( path, 'GET', data as Q ),
		getOne: ( id ) => doRequest<T>( path += '/' + id, 'GET' ),
		create: ( data ) => doRequest<T, U>( path, 'POST', data ),
		update: ( id, data ) => doRequest<T, U>( path += '/' + id, 'PATCH', data ),
		delete: ( id ) => doRequest<T>( path += '/' + id, 'DELETE' ),
	};
}

export async function doRequest<T, D = {}>( path: string, requestMethod: method, data?: D ): Promise<T> {
	return apiFetch<T, D>( {
		path,
		method: requestMethod,
		data,
	} );
}

export default function wpapi<C extends CustomRoutes>( customRoutes?: CustomRoutes ): Routes & C {
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

	return routes as Routes & C;
}
