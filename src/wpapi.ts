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

export default function wpapi<C extends CustomRoutes = {}>( customRoutes?: CustomRoutes ): Routes & C {
	const routes = {
		// Use another site's nonce.
		setNonce: ( nonce: string ) => apiFetch.use( apiFetch.createNonceMiddleware( nonce ) ),
		// Point to another site's URL.
		setRootURL: ( URL: string ) => apiFetch.use( apiFetch.createRootURLMiddleware( URL ) ),
	};

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

	Object.keys( coreRoutes ).map( route => {
		routes[ route ] = createMethods( '/wp/v2/' + route );
	} );

	if ( typeof customRoutes !== 'undefined' ) {
		Object.keys( customRoutes ).map( ( route ) => {
			routes[ route ] = customRoutes[ route ];
		} );
	}

	return routes as Routes & C;
}
