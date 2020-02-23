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
import {parseResponseAndNormalizeError} from './util/parse-response';
import {addQueryArgs} from '@wordpress/url';

export interface CustomRoutes {
	[ route: string ]: () => RequestMethods<any, any, any>;
}

export interface Pagination<T> {
	totalPages: number;
	items: T[],
}


export interface Routes {
	categories: <T = Category, Q = any, U = any>() => RequestMethods<T, Q, U>;
	comments: <T = Comment, Q = any, U = CommentCreate>() => RequestMethods<T, Q, U>;
	media: <T = Media, Q = any, U = any>() => RequestMethods<T, Q, U>;
	statuses: <T = any, Q = any, U = any>() => RequestMethods<T, Q, U>;
	pages: <T = Post, Q = PostsQuery, U = any>() => RequestMethods<T, Q, U>;
	posts: <T = Post, Q = PostsQuery, U = any>() => RequestMethods<T, Q, U>;
	settings: <T = Settings, Q = any, U = any>() => RequestMethods<T, Q, U>;
	tags: <T = any, Q = any, U = any>() => RequestMethods<T, Q, U>;
	taxonomies: <T = Taxonomy, Q = any, U = any>() => RequestMethods<T, Q, U>;
	types: <T = Type, Q = any, U = any>() => RequestMethods<T, Q, U>;
	users: <T = User, Q = UsersQuery, U = UserUpdate>() => RequestMethods<T, Q, U>;
	search: <T = any, Q = any, U = any>() => RequestMethods<T, Q, U>;
}


/**
 * T = Object Structure.
 * Q = Query params.
 * U = Update object properties.
 */
export interface RequestMethods<T, Q, U> {
	get: ( options?: Q ) => Promise<T[]>;
	getById: ( id: number ) => Promise<T>;
	getWithPagination: ( options?: Q ) => Promise<Pagination<T[]>>;
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
		create: data => doRequest<T, U>( path, 'POST', data ),
		delete: id => doRequest<T>( path += '/' + id, 'DELETE' ),
		get: ( data?: Q | undefined ) => doRequest<T[], Q>( path, 'GET', data as Q ),
		getById: id => doRequest<T>( path += '/' + id, 'GET' ),
		getWithPagination: ( data?: Q | undefined ) => doRequestWithPagination<T[], Q>( path, 'GET', data as Q ),
		update: ( id, data ) => doRequest<T, U>( path += '/' + id, 'PATCH', data ),
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
		return apiFetch<T, {}>( {
			method: requestMethod,
			parse,
			path: addQueryArgs( path, data as D ),
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

export default function wpapi<C extends CustomRoutes = {}>( customRoutes?: CustomRoutes ): Routes & C {
	const routes: CustomRoutes = {};

	const coreRoutes = [
		'categories',
		'comments',
		'media',
		'statuses',
		'pages',
		'posts',
		'settings',
		'tags',
		'taxonomies',
		'types',
		'users',
		'search',
	];

	coreRoutes.map( route => routes[ route ] = () => createMethods( '/wp/v2/' + route ) );

	if ( typeof customRoutes !== 'undefined' ) {
		Object.keys( customRoutes ).map( route => routes[ route ] = customRoutes[ route ] );
	}

	return routes as Routes & C;
}
