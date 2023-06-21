import {useDispatch, useSelect} from '@wordpress/data';
import {PostMeta} from '@wordpress/api/posts';
import {PostEditing} from '@wordpress/edit-post';
import {useCallback} from 'react';

/**
 * Support passing a Type for the meta shape.
 */
interface PostEdit<T extends {}> extends PostEditing {
	meta: T;
}

// Work with entire meta object.
export function usePostMeta<T extends PostMeta, K extends keyof T = keyof T>(): [ T, ( key: K, value: T[K] ) => void, T ];
// Work with a single key.
export function usePostMeta<T extends PostMeta, K extends keyof T = keyof T>( metaKey: K ): [ T[K], ( value: T[K] ) => void, T[K] ];

/**
 * Hook for simple interactions with the current post's meta
 * from sidebars or meta boxes within Gutenberg.
 *
 * Will return the current meta state as well as the original meta
 * state before any changes were made.
 *
 * @link https://developer.wordpress.org/block-editor/how-to-guides/plugin-sidebar-0/plugin-sidebar-5-update-meta/
 *
 * @param {string} [metaKey] - Pass a meta key to work with an individual meta key.
 *                           By default will work with entire meta object.
 */
export function usePostMeta<T extends PostMeta, K extends keyof T = keyof T>( metaKey?: K ) {
	const {editPost} = useDispatch( 'core/editor' );
	const meta = useSelect( select => ( {
		previous: select( 'core/editor' ).getCurrentPostAttribute<PostEdit<T>, 'meta'>( 'meta' ),
		current: select( 'core/editor' ).getEditedPostAttribute<PostEdit<T>, 'meta'>( 'meta' ),
	} ) );

	const current = metaKey ? meta.current[ metaKey ] : meta.current;
	const previous = metaKey ? meta.previous[ metaKey ] : meta.previous;

	/**
	 * Update a single value.
	 */
	const updateSingle = useCallback( ( value: T[K] ) => {
		if ( metaKey ) {
			editPost( {
				meta: {
					[ metaKey ]: value,
				},
			} );
		}
	}, [ editPost, metaKey ] );

	/**
	 * Update the entire object.
	 */
	const updateAll = useCallback( ( key: K, value: T[K] ) => {
		editPost( {
			meta: {
				[ key ]: value,
			},
		} );
	}, [ editPost ] );

	// Working with single meta value.
	if ( metaKey ) {
		return [ current, updateSingle, previous ];
	}

	// Working with entire meta object.
	return [ current, updateAll, previous ];
}
