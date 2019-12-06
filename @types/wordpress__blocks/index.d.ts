declare module '@wordpress/blocks' {
	import {ReactElement} from 'react';

	type dataTypes = 'null' | 'boolean' | 'object' | 'array' | 'number' | 'string' | 'integer';
	export type BlockAttributes = {
		[ key: string ]: {
			type: dataTypes;
			source?: 'text' | 'html' | 'query' | 'attribute' | 'meta';
			default?: any;
			// jQuery selector of element to extract value from.
			selector?: string;
			// Tag to wrap each line when using "html" source and RichText with multiline prop.
			multiline?: string;
			// Meta key if using "meta" source.
			meta?: string;
			// html attribute of selector element if using "attribute" source
			attribute?: string;
			// Extract array of values from markup using "selector" and attributes of html tags.
			query?: {
				[ key: string ]: {
					type: 'null' | 'boolean' | 'object' | 'array' | 'number' | 'string' | 'integer';
					source: 'text' | 'html' | 'query' | 'attribute' | 'meta';
					attribute: string;
				}
			}
			// When using array types, this defines sub types.
			items?: {
				type: dataTypes
			}
			// When using object types, this defines sub types.
			properties?: {
				[key: string ] : {
					type: dataTypes
				}
			}
		}
	};

	export type BlockEditProps<Attr> = {
		className: string;
		setAttributes: ( newValue: {
			[attribute in keyof Attr]?: Attr[attribute]
		} ) => void;
		attributes: Attr
		isSelected: boolean
	}

	// @link https://developer.wordpress.org/block-editor/developers/block-api/block-registration/
	export type registerBlockType = <Attr>( id: string, settings: {
		title: string;
		description?: string;
		category: 'common' | 'formatting' | 'layout' | 'widgets' | 'embed' | string
		// Svg | dashicon | configuration
		icon: string | {
			// Specifying a background color to appear with the icon e.g.: in the inserter.
			background?: string;
			// Specifying a color for the icon
			foreground?: string;
			// Specifying a dashicon for the block
			src: string;
		}
		keywords?: string[];
		styles?: Array<{
			name: string;
			label: string;
			isDefault?: boolean;
		}>
		attributes: BlockAttributes;
		// @todo type this if we end up ever using it.
		transforms?: {
			from: any
			to: any
		}
		// Setting parent lets a block require that it is only available when nested within the specified blocks.
		parent?: string[];
		supports?: {
			align?: boolean | [ 'left' | 'right' | 'full' ]
			// Remove the support for wide alignment.
			alignWide?: boolean;
			// Anchors let you link directly to a specific block on a page. This property adds a field to define an id for the block and a button to copy the direct link.
			anchor?: boolean;
			// Set to false to Remove the support for the custom className.
			customClassName?: boolean;
			// Set to false to Remove the support for the generated className.
			className?: boolean;
			// Set to false to Remove support for an HTML mode.
			html?: boolean;
			// Set to false to Hide this block from the inserter.
			inserter?: boolean;
			// Set to false to Use the block just once per post
			multiple?: boolean;
			// Set to false to Don't allow the block to be converted into a reusable block.
			reusable?: boolean;
		}
		edit: ( attributes: BlockEditProps<Attr> ) => ReactElement;
		save: ( attributes?: BlockEditProps<Attr> ) => ReactElement | null;
	} ) => void;

	export const registerBlockType: registerBlockType;

	export default interface Blocks {
		registerBlockType: registerBlockType
	}
}