declare module '@wordpress/api/posts' {
	import {context, Links, order} from '@wordpress/api';

	/* eslint camelcase: 0 */

	export type PostStatus = 'publish' | 'future' | 'draft' | 'pending' | 'private';
	export type PostMeta = {
		meta: {
			[ key: string ]: any;
		}
	}

	/**
	 * Posts Endpoint.
	 *
	 * @link https://developer.wordpress.org/rest-api/reference/posts/
	 */
	export interface Post {
		id: number;
		date: string;
		date_gmt: string;
		guid: {
			rendered: string;
		}
		modified: string;
		modified_gmt: string;
		slug: string;
		status: PostStatus;
		type: 'post' | string;
		title: {
			rendered: string;
		}
		content: {
			rendered: string;
			protected: boolean;
		}
		excerpt: {
			rendered: string;
			protected: boolean;
		}
		author: number;
		featured_media: number;
		meta: PostMeta;
		comment_status: 'open' | 'closed';
		ping_status: 'open' | 'closed';
		sticky: boolean;
		template: string;
		format: 'standard' | 'aside' | 'chat' | 'gallery' | 'link' | 'image' | 'quote' | 'status' | 'video' | 'audio';
		categories: number[];
		tags: number[];
		_links: Links;
	}

	/**
	 * List Posts.
	 *
	 * https://developer.wordpress.org/rest-api/reference/posts/#arguments
	 */
	export interface PostsQuery {
		context?: context;
		page?: number;
		per_page?: number;
		search?: string;
		after?: string;
		author?: number | number[];
		author_exclude?: number | number[];
		before?: string;
		exclude?: number[];
		include?: number[];
		offset?: number;
		order?: order;
		orderby?: 'author' | 'date' | 'id' | 'include' | 'modified' | 'parent' | 'relevance' | 'slug' | 'include_slugs' | 'title'
		slug?: string;
		status?: PostStatus;
		categories?: number[];
		categories_exclude?: number[];
		tags?: number[];
		tags_exclude?: number[];
		sticky?: boolean;
	}
}
