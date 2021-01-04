import {
	ApplicationPassword,
	ApplicationPasswordCreate,
	Category,
	Comment,
	CommentCreate,
	context,
	Media,
	method,
	Post,
	PostsQuery,
	Settings,
	Taxonomy,
	Type,
	User,
	UserCreate,
	UsersQuery,
} from '@wordpress/api';
import apiFetch from '@wordpress/api-fetch';
import {parseResponseAndNormalizeError} from './util/parse-response';
import {addQueryArgs} from '@wordpress/url';
import {PostCreate} from '@wordpress/api/posts';
import {Page, PageCreate, PagesQuery} from '@wordpress/api/pages';
import {defaultFetchHandler} from './util/request-handler';
import {UserUpdate} from '@wordpress/api/users';

export type CustomRoutes<K> = {
	[path in keyof K]: () => RequestMethods<any, any, any>;
}

export interface Pagination<T> {
	totalPages: number;
	items: T[],
}


export interface Routes {
	applicationPasswords: <T = ApplicationPassword, U = ApplicationPasswordCreate>() => {
		create: ( userId: number, data: U ) => Promise<T & { password: string; }>;
		delete: ( userId: number, uuid: string ) => Promise<{ deleted: boolean, previous: T }>;
		get: ( userId: number ) => Promise<T[]>;
		getById: ( userId: number, uuid: string ) => Promise<T>;
		update: ( userId: number, uuid: string, data: U ) => Promise<T>;
	};
	categories: <T = Category, Q = any, U = any>() => RequestMethods<T, Q, U>;
	comments: <T = Comment, Q = any, U = CommentCreate>() => RequestMethods<T, Q, U>;
	media: <T = Media, Q = any, U = any>() => RequestMethods<T, Q, U>;
	statuses: <T = any, Q = any, U = any>() => RequestMethods<T, Q, U>;
	pages: <T = Page, Q = PagesQuery, U = PageCreate>() => RequestMethods<T, Q, U>;
	posts: <T = Post, Q = PostsQuery, U = PostCreate>() => RequestMethods<T, Q, U>;
	tags: <T = any, Q = any, U = any>() => RequestMethods<T, Q, U>;
	taxonomies: <T = Taxonomy, Q = any, U = any>() => RequestMethods<T, Q, U>;
	types: <T = Type, Q = any, U = any>() => RequestMethods<T, Q, U>;
	users: <T = User, Q = UsersQuery, U = UserUpdate, C = UserCreate>() => Omit<RequestMethods<T, Q, U, C>, 'delete' | 'trash' | 'update'> & {
		delete: ( id: number, reassign?: number ) => Promise<{ deleted: boolean, previous: T }>
		update: ( data: U ) => Promise<Required<C> & T>;
	}
	search: <T = any, Q = any, U = any>() => RequestMethods<T, Q, U>;
	settings: <T = Settings, U = Partial<T>>() => {
		get: () => Promise<T>;
		update: ( data: U ) => Promise<T>;
	};
}


/**
 * T = Object Structure.
 * Q = Query params.
 * U = Update object properties.
 */
export interface RequestMethods<T, Q, U, C = U> {
	create: ( data: C ) => Promise<T>;
	delete: ( id: number ) => Promise<{ deleted: boolean, previous: T }>;
	get: ( options?: Q ) => Promise<T[]>;
	getById: ( id: number, data?: { password?: string, context?: context } ) => Promise<T>;
	getWithPagination: ( options?: Q ) => Promise<Pagination<T>>;
	trash: ( id: number ) => Promise<T>;
	update: ( data: U & { id: number } ) => Promise<T>;
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
		/**
		 * Create a new item.
		 *
		 * @param data
		 */
		create: data => doRequest<T, U>( path, 'POST', data ),
		/**
		 * Force delete while skipping trash.
		 *
		 * @param id
		 */
		delete: id => doRequest<{ deleted: boolean, previous: T }, { force: true }>( path += '/' + id, 'DELETE', {force: true} ),
		/**
		 * Get items based on query arguments or no query arguments for default response.
		 *
		 * @param data
		 */
		get: ( data?: Q | undefined ) => doRequest<T[], Q>( path, 'GET', data as Q ),
		/**
		 * Get an item by it's id.
		 *
		 * @param id
		 * @param {Object} data = {
		 *     context?: set to 'edit' if authenticated and want all properties.
		 *     password?: if the item is password protected (Probably only posts and pages);
		 * }
		 */
		getById: ( id, data? ) => doRequest<T, { password?: string, context?: context }>( path += '/' + id, 'GET', data ),
		/**
		 * Same as `get` but returns the pagination information as well as
		 * the items.
		 *
		 * @param data
		 */
		getWithPagination: ( data?: Q | undefined ) => doRequestWithPagination<T, Q>( path, 'GET', data as Q ),
		/**
		 * Move an item to trash without force deleting it.
		 * Many types do not support this method and must use
		 * the `delete` method.
		 *
		 * @param id
		 */
		trash: id => doRequest<T>( path += '/' + id, 'DELETE' ),
		/**
		 * Update an item.
		 *
		 * @param data
		 */
		update: data => doRequest<T, U>( path += '/' + data.id, 'PATCH', data ),
	};
}

/**
 * T = Object structure | Response if parse is false.
 * D = Query params.
 *
 * @param path - Path relative to root.
 * @param requestMethod - GET, POST, PUT, DELETE, PATCH
 * @param data - Query params.
 * @param parse - To parse the json result, or return raw Request
 */
export async function doRequest<T, D = {}>( path: string, requestMethod: method, data?: D, parse: boolean = true ): Promise<T> {
	if ( 'undefined' === typeof data || 'GET' === requestMethod ) {
		return apiFetch<T, D>( {
			method: requestMethod,
			parse,
			path: addQueryArgs( path, data ),
		} );
	}
	return apiFetch<T, D>( {
		data,
		method: requestMethod,
		parse,
		path,
	} );
}

/**
 * T = Object structure.
 * D = Query params.
 *
 * @param path - Path relative to root.
 * @param requestMethod - GET, POST, PUT, DELETE, PATCH
 * @param data - Query params.
 */
export async function doRequestWithPagination<T, D = {}>( path: string, requestMethod: method, data?: D ): Promise<Pagination<T>> {
	const Result = await doRequest<Response, D>( path, requestMethod, data, false );
	const items = await parseResponseAndNormalizeError( Result );
	return {
		items,
		totalPages: parseInt( Result.headers.get( 'X-WP-TotalPages' ) || '1' ),
	};
}

export default function wpapi<T extends CustomRoutes<T> = {}>( customRoutes?: T ): Routes & T {
	const routes: any = {};

	const coreRoutes = [
		'categories',
		'comments',
		'media',
		'statuses',
		'pages',
		'posts',
		'tags',
		'taxonomies',
		'types',
		'search',
	];

	coreRoutes.map( route => routes[ route ] = () => createMethods( '/wp/v2/' + route ) );

	// Users have a special parameter required for delete.
	routes.users = () => {
		const methods = createMethods( '/wp/v2/users' );
		methods.delete = ( id, reassign = false ) => doRequest( '/wp/v2/users/' + id, 'DELETE', {
			force: true,
			reassign,
		} );
		return methods;
	};

	// Application passwords have special endpoints.
	routes.applicationPasswords = () => {
		return {
			create: ( userId, data ) => doRequest( `/wp/v2/users/${userId}/application-passwords`, 'POST', data ),
			delete: ( userId, uuid ) => doRequest( `/wp/v2/users/${userId}/application-passwords/${uuid}`, 'DELETE' ),
			get: userId => doRequest( `/wp/v2/users/${userId}/application-passwords`, 'GET' ),
			getById: ( userId, uuid ) => doRequest( `/wp/v2/users/${userId}/application-passwords/${uuid}`, 'GET' ),
			update: ( userId, uuid, data ) => doRequest( `/wp/v2/users/${userId}/application-passwords/${uuid}`, 'PUT', data ),
		};
	};

	// Settings has limited/special endpoints.
	routes.settings = () => {
		return {
			get: () => doRequest( '/wp/v2/settings', 'GET' ),
			update: data => doRequest( '/wp/v2/settings', 'POST', data ),
		};
	};

	if ( typeof customRoutes !== 'undefined' ) {
		Object.keys( customRoutes ).map( route => routes[ route ] = customRoutes[ route ] );
	}

	apiFetch.setFetchHandler( defaultFetchHandler );

	return routes as Routes & T;
}
