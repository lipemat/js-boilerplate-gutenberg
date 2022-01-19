import {useDispatch, useSelect} from '@wordpress/data';
import {useCallback} from 'react';

type Taxonomies = 'category' | 'post_tag' | 'nav_menu';


/**
 * Hook for simple interactions with the current post's terms
 * from sidebars or meta boxes within Gutenberg
 *
 * Will return the current terms state as well as the original terms
 * state before any changes were made.
 *
 */
export function useTerms<T extends string = Taxonomies>( taxonomySlug: T ): [ number[], ( terms: number[] ) => Promise<undefined>, number[] ] {
	const {editPost} = useDispatch( 'core/editor' );
	const data = useSelect( select => {
		const taxonomy = select( 'core' ).getTaxonomy( taxonomySlug );
		if ( ! taxonomy ) {
			return {
				current: [],
				previous: [],
			};
		}
		return {
			taxonomy,
			current: select( 'core/editor' ).getEditedPostAttribute<{ [key in T]: number[] }, T>( taxonomy.rest_base as T ),
			previous: select( 'core/editor' ).getCurrentPostAttribute<{ [key in T]: number[] }, T>( taxonomy.rest_base as T ),
		};
	} );

	const updateTerms = useCallback( async( terms: number[] ): Promise<undefined> => {
		if ( ! data.taxonomy ) {
			return undefined;
		}
		return await editPost( {
			[ data.taxonomy.rest_base ]: terms,
		} );
	}, [ data, editPost ] );

	return [ data.current, updateTerms, data.previous ];
}
