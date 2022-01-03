import {
	ApplicationPassword,
	ApplicationPasswordCreate,
	CategoriesQuery,
	Category,
	CategoryCreate,
	CategoryUpdate,
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
import {SearchItem, SearchQuery} from '@wordpress/api/search';
import {UserUpdate} from '@wordpress/api/users';
import {Menu, MenuCreate, MenusQuery, MenuUpdate} from '@wordpress/api/menus';
import {MenuItem, MenuItemCreate, MenuItemsQuery, MenuItemUpdate} from '@wordpress/api/menu-items';
import {MenuLocation} from '@wordpress/api/menu-locations';

export type CustomRoutes<K> = {
	[path in keyof K]: () => RequestMethods<any, any, any>;
}

export interface Pagination<T> {
	totalItems: number;
	totalPages: number;
	items: T[],
}


export interface Routes {
	applicationPasswords: <T = ApplicationPassword, U = ApplicationPasswordCreate>() => {
		create: ( userId: number | 'me', data: U ) => Promise<T & { password: string; }>;
		delete: ( userId: number | 'me', uuid: string ) => Promise<{ deleted: boolean, previous: T }>;
		get: ( userId: number | 'me' ) => Promise<T[]>;
		getById: ( userId: number | 'me', uuid: string ) => Promise<T>;
		introspect: ( userId: number | 'me' ) => Promise<T>;
		update: ( userId: number | 'me', uuid: string, data: U ) => Promise<T>;
	};
	categories: <T = Category, Q = CategoriesQuery, U = CategoryUpdate, C = CategoryCreate>() => Omit<RequestMethods<T, Q, U, C>, 'trash'>;
	comments: <T = Comment, Q = any, U = CommentCreate>() => RequestMethods<T, Q, U>;
	media: <T = Media, Q = any, U = any>() => RequestMethods<T, Q, U>;
	menus: <T = Menu, Q = MenusQuery, U = MenuUpdate, C = MenuCreate>() => Omit<RequestMethods<T, Q, U, C>, 'trash'>;
	menuItems: <T = MenuItem, Q = MenuItemsQuery,  U = MenuItemUpdate, C = MenuItemCreate>() => RequestMethods<T, Q, U, C>;
	menuLocations: <T = MenuLocation>() => {
		get: () => Promise<{[name:string]: T}>;
		getById: ( id: string ) => Promise<T>;
	};
	statuses: <T = any, Q = any, U = any>() => RequestMethods<T, Q, U>;
	pages: <T = Page, Q = PagesQuery, U = PageCreate>() => RequestMethods<T, Q, U>;
	posts: <T = Post, Q = PostsQuery, U = PostCreate>() => RequestMethods<T, Q, U>;
	tags: <T = any, Q = any, U = any, C = U>() => Omit<RequestMethods<T, Q, U, C>, 'trash'>;
	taxonomies: <T = Taxonomy, Q = any, U = any>() => RequestMethods<T, Q, U>;
	types: <T = Type, Q = any, U = any>() => RequestMethods<T, Q, U>;
	users: <T = User, Q = UsersQuery, U = UserUpdate, C = UserCreate, E = Required<C> & T>() => Omit<RequestMethods<T, Q, U, C, E>, 'delete' | 'trash'> & {
		delete: ( id: number, reassign?: number ) => Promise<{ deleted: boolean, previous: T }>;
	}
	search: <T = SearchItem, Q = SearchQuery>() => {
		get: ( options?: Q ) => Promise<T[]>;
		getWithPagination: ( options?: Q ) => Promise<Pagination<T>>;
	}
	settings: <T = Settings, U = Partial<T>>() => {
		get: () => Promise<T>;
		update: ( data: U ) => Promise<T>;
	};
}


/**
 * T = Object Structure.
 * Q = Query params.
 * U = Update object properties.
 * C = Create object properties.
 * E = Object properties under 'edit' context.
 */
export interface RequestMethods<T, Q, U, C = U, E = T> {
	create: ( data: C ) => Promise<E>;
	delete: ( id: number ) => Promise<{ deleted: boolean, previous: E }>;
	get: ( options?: Q ) => Promise<T[]>;
	getById: ( id: number, data?: { password?: string, context?: context } ) => Promise<T>;
	getWithPagination: ( options?: Q ) => Promise<Pagination<T>>;
	trash: ( id: number ) => Promise<E>;
	update: ( data: U & { id: number } ) => Promise<E>;
}


/**
 * T = Object Structure.
 * Q = Query params.
 * U = Update object properties.
 * C = Create object properties.
 * E = Object properties under 'edit' context.
 *
 * @param path
 */
export function createMethods<T, Q, U, C = U, E = T>( path: string ): RequestMethods<T, Q, U, C, E> {
	return {
		/**
		 * Create a new item.
		 *
		 * @param data
		 */
		create: data => doRequest<E, C>( path, 'POST', data ),
		/**
		 * Force delete while skipping trash.
		 *
		 * @param id
		 */
		delete: id => doRequest<{ deleted: boolean, previous: E }, { force: true }>( path += '/' + id, 'DELETE', {force: true} ),
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
		trash: id => doRequest<E>( path += '/' + id, 'DELETE' ),
		/**
		 * Update an item.
		 *
		 * @param data
		 */
		update: data => doRequest<E, U>( path += '/' + data.id, 'PATCH', data ),
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
		totalItems: parseInt( Result.headers.get( 'X-WP-Total' ) || '0' ),
	};
}

export default function wpapi<T extends CustomRoutes<T> = {}>( customRoutes?: T ): Routes & T {
	const routes: any = {};

	const coreRoutes = [
		'categories',
		'comments',
		'media',
		'menus',
		'menu-locations',
		'menu-items',
		'statuses',
		'pages',
		'posts',
		'tags',
		'taxonomies',
		'types',
		'search',
	];

	coreRoutes.map( route => routes[ route ] = () => createMethods( '/wp/v2/' + route ) );

	// Menu items use a "-".
	routes.menuLocations = () => createMethods( '/wp/v2/menu-locations' );
	routes.menuItems = () => createMethods( '/wp/v2/menu-items' );

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
			introspect: userId => doRequest( `/wp/v2/users/${userId}/application-passwords/introspect`, 'GET' ),
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
