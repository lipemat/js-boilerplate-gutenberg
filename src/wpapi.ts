import type {ApplicationPassword, ApplicationPasswordCreate, Context, Global, Method, Post, PostsQuery, Settings, Taxonomy, Type, TypesQuery} from '@wordpress/api';
import {type ErrorResponse, parseResponseAndNormalizeError} from './util/parse-response';
import type {CategoriesQuery, Category, CategoryCreate, CategoryUpdate} from '@wordpress/api/categories';
import type {Comment, CommentCreate, CommentsQuery, CommentUpdate} from '@wordpress/api/comments';
import type {PostCreate, PostUpdate} from '@wordpress/api/posts';
import type {Page, PageCreate, PagesQuery, PageUpdate} from '@wordpress/api/pages';
import type {Media, MediaCreate, MediaQuery, MediaUpdate} from '@wordpress/api/media';
import {fetchHandler, maybeRefreshNonce} from './util/request-handler';
import type {SearchItem, SearchQuery} from '@wordpress/api/search';
import type {Menu, MenuCreate, MenusQuery, MenuUpdate} from '@wordpress/api/menus';
import type {User, UserCreate, UsersQuery, UserUpdate} from '@wordpress/api/users';
import type {MenuItem, MenuItemCreate, MenuItemsQuery, MenuItemUpdate} from '@wordpress/api/menu-items';
import type {MenuLocation} from '@wordpress/api/menu-locations';
import type {EditorBlock, EditorBlockCreate, EditorBlocksQuery, EditorBlockUpdate} from '@wordpress/api/editor-blocks';
import type {TaxonomiesQuery} from '@wordpress/api/taxonomies';
import {addLeadingSlash, addTrailingSlash, type QueryArgs} from './helpers/url';
import type {Status, StatusQuery} from '@wordpress/api/statuses';
import {addQueryArgs} from './util/url';

export type CustomRoutes<K> = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is a super generic type.
	[path in keyof K]: () => Partial<RequestMethods<any, any, any>> | RequestMethods<any, any, any>;
}

export interface Pagination<T> {
	totalItems: number;
	totalPages: number;
	items: T[],
}

export interface Routes {
	applicationPasswords: <T = ApplicationPassword, U = ApplicationPasswordCreate>() => {
		create: ( userId: number | 'me', data: U ) => Promise<T & { password: string; }>;
		delete: ( userId: number | 'me', uuid: string ) => Promise<{
			deleted: boolean,
			previous: T
		}>;
		get: ( userId: number | 'me' ) => Promise<T[]>;
		getById: ( userId: number | 'me', uuid: string ) => Promise<T>;
		introspect: ( userId: number | 'me' ) => Promise<T>;
		update: ( userId: number | 'me', uuid: string, data: U ) => Promise<T>;
	};
	blocks: <T = EditorBlock, Q = EditorBlocksQuery, U = EditorBlockUpdate, C = EditorBlockCreate, E = EditorBlock<'edit'>>() => RequestMethods<T, Q, U, C, E>;
	categories: <T = Category, Q = CategoriesQuery, U = CategoryUpdate, C = CategoryCreate, E = Category<'edit'>>() => Omit<RequestMethods<T, Q, U, C, E>, 'trash'>;
	comments: <T = Comment, Q = CommentsQuery, U = CommentUpdate, C = CommentCreate, E = Comment<'edit'>>() => RequestMethods<T, Q, U, C, E>;
	media: <T = Media, Q = MediaQuery, U = MediaUpdate, C = MediaCreate, E = Media<'edit'>>() => Omit<RequestMethods<T, Q, U, C, E>, 'trash'>;
	menus: <T = Menu, Q = MenusQuery, U = MenuUpdate, C = MenuCreate, E = Menu<'edit'>>() => Omit<RequestMethods<T, Q, U, C, E>, 'trash'>;
	menuItems: <T = MenuItem, Q = MenuItemsQuery, U = MenuItemUpdate, C = MenuItemCreate>() => RequestMethods<T, Q, U, C>;
	menuLocations: <T = MenuLocation>() => {
		get: () => Promise<{ [ name: string ]: T }>;
		getById: ( location: string ) => Promise<T>;
	};
	pages: <T = Page, Q = PagesQuery, U = PageUpdate, C = PageCreate, E = Page<'edit'>>() => RequestMethods<T, Q, U, C, E>;
	posts: <T = Post, Q = PostsQuery, U = PostUpdate, C = PostCreate, E = Post<'edit'>>() => RequestMethods<T, Q, U, C, E>;
	tags: <T = Category, Q = CategoriesQuery, U = CategoryUpdate, C = CategoryCreate, E = Category<'edit'>>() => Omit<RequestMethods<T, Q, U, C, E>, 'trash'>;
	taxonomies: <T = Taxonomy, Q = TaxonomiesQuery>() => Pick<RequestMethods<T, Q, never>, 'get' | 'getById'>;
	types: <T = Type, Q = TypesQuery>() => {
		get: ( options?: Q ) => Promise<{ [ type: string ]: T }>;
		getById: ( postType: string ) => Promise<T>;
	};
	users: <T = User, Q = UsersQuery, U = UserUpdate, C = UserCreate, E = User<'edit'>>() => Omit<RequestMethods<T, Q, U, C, E>, 'delete' | 'trash'> & {
		delete: ( id: number, reassign?: number ) => Promise<{ deleted: boolean, previous: T }>;
	};
	search: <T = SearchItem, Q = SearchQuery>() => {
		get: ( options?: Q ) => Promise<T[]>;
		getWithPagination: ( options?: Q ) => Promise<Pagination<T>>;
	};
	settings: <T = Settings, U = Partial<T>>() => {
		get: () => Promise<T>;
		update: ( data: U ) => Promise<T>;
	};
	statuses: <T = Status, Q = StatusQuery>() => {
		get: ( options?: Q ) => Promise<{ [ status: string ]: T }>;
	};
}


/**
 * T = Object Structure.
 * Q = Query params.
 * U = Update any properties.
 * C = Create any properties.
 * E = Object properties under 'edit' context.
 */
export interface RequestMethods<T, Q, U, C = U, E = T> {
	create: ( data: C ) => Promise<E>;
	delete: ( id: number ) => Promise<{ deleted: boolean, previous: E }>;
	get: ( options?: Q ) => Promise<T[]>;
	getById: ( id: number, data?: Global<T> & { password?: string } ) => Promise<T>;
	getWithPagination: ( options?: Q ) => Promise<Pagination<T>>;
	trash: ( id: number ) => Promise<E>;
	update: ( data: U & { id: number } ) => Promise<E>;
}


/**
 * T = Object Structure.
 * Q = Query params.
 * U = Update any properties.
 * C = Create any properties.
 * E = Object properties under 'edit' context.
 *
 * @param path
 */
export function createMethods<T, Q, U, C = U, E = T>( path: string ): RequestMethods<T, Q, U, C, E> {
	const sanitizedPath = addLeadingSlash( path );

	return {
		/**
		 * Create a new item.
		 *
		 * @param data
		 */
		create: data => doRequest<E, C>( sanitizedPath, 'POST', data ),
		/**
		 * Force delete while skipping trash.
		 *
		 * @param id
		 */
		delete: id => doRequest<{ deleted: boolean, previous: E }, {
			force: true
		}>( addTrailingSlash( sanitizedPath ) + id, 'DELETE', {force: true} ),
		/**
		 * Get items based on query arguments or no query arguments for default response.
		 *
		 * @param data
		 */
		get: ( data?: Q | undefined ) => doRequest<T[], Q>( sanitizedPath, 'GET', data as Q ),
		/**
		 * Get an item by its id.
		 *
		 * @param id
		 * @param data = {
		 *             context?: set to 'edit' if authenticated and want all properties.
		 *             password?: if the item is password protected (Probably only posts and pages);
		 *             }
		 */
		getById: ( id: number, data? ) => doRequest<T, {
			password?: string,
			context?: Context
		}>( addTrailingSlash( sanitizedPath ) + id, 'GET', data ),
		/**
		 * Same as `get` but returns the pagination information as well as
		 * the items.
		 *
		 * @param data
		 */
		getWithPagination: ( data?: Q | undefined ) => doRequestWithPagination<T, Q>( sanitizedPath, 'GET', data as Q ),
		/**
		 * Move an item to trash without force deleting it.
		 * Many types do not support this method and must use
		 * the `delete` method.
		 *
		 * @param id
		 */
		trash: id => doRequest<E>( addTrailingSlash( sanitizedPath ) + id, 'DELETE' ),
		/**
		 * Update an item.
		 *
		 * @param data
		 */
		update: data => doRequest<E, U>( addTrailingSlash( sanitizedPath ) + data.id, 'PATCH', data ),
	};
}

/**
 * T = Object structure | Response if parse is false.
 * D = Query params.
 *
 * @param path          - Path relative to root.
 * @param requestMethod - GET, POST, PUT, DELETE, PATCH
 * @param data          - Query params.
 * @param parse         - To parse the json result, or return raw Request
 */
export async function doRequest<T, D = QueryArgs>( path: string, requestMethod: Method, data?: D, parse: boolean = true ): Promise<T> {
	if ( 'undefined' === typeof data || 'GET' === requestMethod || 'OPTIONS' === requestMethod ) {
		return fetchHandler<T, D>( {
			method: requestMethod as Exclude<Method, 'POST' | 'PUT' | 'PATCH' | 'DELETE'>,
			parse,
			path: addQueryArgs( path, data ?? {} ),
		} );
	}
	return fetchHandler<T, D>( {
		data,
		method: requestMethod as Exclude<Method, 'GET' | 'OPTIONS'>,
		parse,
		path,
	} );
}

/**
 * T = Object structure.
 * D = Query params.
 *
 * @param path          - Path relative to root.
 * @param requestMethod - GET, POST, PUT, DELETE, PATCH
 * @param data          - Query params.
 */
export async function doRequestWithPagination<T, D = QueryArgs>( path: string, requestMethod: Method, data?: D ): Promise<Pagination<T>> {
	let Result: Response;
	try {
		Result = await doRequest<Response, D>( path, requestMethod, data, false );
	} catch ( error ) {
		const parsedError: ErrorResponse = await parseResponseAndNormalizeError<ErrorResponse>( error as Response );
		return maybeRefreshNonce<Pagination<T>>( parsedError, () => doRequestWithPagination( path, requestMethod, data ) );
	}

	const items = await parseResponseAndNormalizeError<T[]>( Result );

	return {
		items,
		totalPages: parseInt( Result.headers.get( 'X-WP-TotalPages' ) ?? '1' ),
		totalItems: parseInt( Result.headers.get( 'X-WP-Total' ) ?? '0' ),
	};
}

export default function wpapi<T extends CustomRoutes<T>>( customRoutes?: T ): Routes & T {
	const routes: { [ key: string ]: () => object } = {};

	const coreRoutes = [
		'categories',
		'comments',
		'blocks',
		'media',
		'menus',
		'menu-locations',
		'menu-items',
		'pages',
		'posts',
		'tags',
		'taxonomies',
		'search',
	];

	coreRoutes.map( route => routes[ route ] = () => createMethods( '/wp/v2/' + route ) );

	// Menu items use a '-'.
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
			create: ( userId: number, data: ApplicationPasswordCreate ) => doRequest( `/wp/v2/users/${userId}/application-passwords`, 'POST', data ),
			delete: ( userId: number, uuid: string ) => doRequest( `/wp/v2/users/${userId}/application-passwords/${uuid}`, 'DELETE' ),
			get: ( userId: number ) => doRequest( `/wp/v2/users/${userId}/application-passwords`, 'GET' ),
			getById: ( userId: number, uuid: string ) => doRequest( `/wp/v2/users/${userId}/application-passwords/${uuid}`, 'GET' ),
			introspect: ( userId: number ) => doRequest( `/wp/v2/users/${userId}/application-passwords/introspect`, 'GET' ),
			update: ( userId: number, uuid: string, data: ApplicationPasswordCreate ) => doRequest( `/wp/v2/users/${userId}/application-passwords/${uuid}`, 'PUT', data ),
		};
	};

	// Menu locations have limited endpoints.
	routes.menuLocations = () => {
		return {
			get: () => doRequest( '/wp/v2/menu-locations', 'GET' ),
			getById: ( location: string ) => doRequest( `/wp/v2/menu-locations/${location}`, 'GET' ),
		};
	};

	// Settings has limited/special endpoints.
	routes.settings = () => {
		return {
			get: () => doRequest( '/wp/v2/settings', 'GET' ),
			update: ( data: Partial<Settings> ) => doRequest( '/wp/v2/settings', 'POST', data ),
		};
	};

	// Statuses have limited endpoints.
	routes.statuses = () => {
		return {
			get: ( data?: StatusQuery ) => doRequest( '/wp/v2/statuses', 'GET', data ?? {} ),
		};
	};

	// Types have limited endpoints.
	routes.types = () => {
		return {
			get: () => doRequest( '/wp/v2/types', 'GET' ),
			getById: ( postType: string ) => doRequest( `'/wp/v2/types'/${postType}`, 'GET' ),
		};
	};

	if ( typeof customRoutes !== 'undefined' ) {
		// @ts-ignore -- Object keys can't be mapped.
		Object.keys( customRoutes ).map( route => routes[ route ] = customRoutes[ route ] );
	}

	return routes as Routes & T;
}
