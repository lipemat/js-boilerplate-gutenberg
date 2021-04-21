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
 * @param taxonomy
 */
function useTerms<T extends string = Taxonomies>( taxonomy: T ): [ number[], ( terms: number[] ) => void, number[] ] {
	const {editPost} = useDispatch( 'core/editor' );
	const data = useSelect( select => {
		const taxonomyObject = select( 'core' ).getTaxonomy( taxonomy );
		return {
			taxonomy: taxonomyObject,
			current: select( 'core/editor' ).getEditedPostAttribute<{ [key in T]: number[] }, T>( taxonomyObject.rest_base as T ),
			previous: select( 'core/editor' ).getCurrentPostAttribute<{ [key in T]: number[] }, T>( taxonomyObject.rest_base as T ),
		};
	} );

	const updateTerms = useCallback( ( terms: number[] ) => {
		editPost( {
			[ data.taxonomy.rest_base ]: terms,
		} );
	}, [ data, editPost ] );

	return [ data.current, updateTerms, data.previous ];
}

export default useTerms;
