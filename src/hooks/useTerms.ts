import {useDispatch, useSelect} from '@wordpress/data';
import {useCallback} from './useCallback';
import type {Taxonomy} from '@wordpress/api/taxonomies';

type Taxonomies = 'category' | 'post_tag' | 'nav_menu';


/**
 * Hook for simple interactions with the current post's terms
 * from sidebars or meta boxes within Gutenberg
 *
 * Returns:
 * - The current terms for the given taxonomy.
 * - Original terms for the given taxonomy before any changes were made.
 * - A function to update the terms for the given taxonomy.
 */
export function useTerms<T extends string = Taxonomies>( taxonomySlug: T ): [ number[], ( terms: number[] ) => Promise<undefined>, number[] ] {
	const {editPost} = useDispatch( 'core/editor' );
	const data = useSelect( select => {
		const taxonomy: Taxonomy<'edit'> | undefined = select( 'core' ).getTaxonomy( taxonomySlug );
		if ( ! taxonomy ) {
			return {
				taxonomy: null,
				current: null,
				previous: null,
			};
		}
		return {
			taxonomy,
			current: select( 'core/editor' ).getEditedPostAttribute<{ [key in T]: number[] }, T>( taxonomy.rest_base as T ),
			previous: select( 'core/editor' ).getCurrentPostAttribute<{ [key in T]: number[] }, T>( taxonomy.rest_base as T ),
		};
	}, [ taxonomySlug ] );

	const updateTerms = useCallback( async ( terms: number[] ): Promise<undefined> => {
		if ( ! data.taxonomy ) {
			return undefined;
		}
		return await editPost( {
			[ data.taxonomy.rest_base ]: terms,
		} );
	}, [ data, editPost ] );

	return [ data.current ?? [], updateTerms, data.previous ?? [] ];
}
