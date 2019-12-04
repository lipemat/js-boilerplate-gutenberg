declare module '@wordpress/editor' {
	import {ComponentType} from 'react';
	import {withInstanceIdProps} from '@wordpress/compose';
	import {withSpokenMessages} from '@wordpress/components'


	/**
	 * @notice Not publicly available yet!!
	 *
	 * @issue https://github.com/WordPress/gutenberg/issues/17476
	 */
	interface HierarchicalTermSelector extends withInstanceIdProps, withSpokenMessages {
		hasCreateAction?: boolean;
		hasAssignAction?: boolean;
		terms?: Array<{
			id: number;
			count: number;
			description: string;
			link: string;
			name: string;
			taxonomy: string;
			parent: number;
		}>;
		slug: string;
		taxonomy?: string;
	}

	export const HierarchicalTermSelector: ComponentType<HierarchicalTermSelector>;

	export default interface Editor {
		HierarchicalTermSelector: ComponentType<HierarchicalTermSelector>;
	}
}
