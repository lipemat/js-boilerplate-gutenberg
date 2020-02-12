/**
 * Definitions for the `@wordpress/icons` package.
 *
 * Currently not available as a global variable and must
 * be used from the package directly.
 *
 * It's possible to use an icon constant directly but it will
 * always be 24 by 24. To support changing size or other SVG
 * attributes use it like so.
 * `<Icon icon={ check } size={48} />`
 *
 * @link https://www.npmjs.com/package/@wordpress/icons
 *
 * @todo Adjust configurations to use webpack external and remove
 *       direct package access and package.json dependency
 *       when available in WP Core.
 */
declare module '@wordpress/icons' {
	import {ComponentType, SVGAttributes} from 'react';

	type IconType = ComponentType<{}>;

	interface Icon extends SVGAttributes<SVGElement> {
		icon: IconType;
		size?: number;
	}


	export const alignCenter: IconType;
	export const alignJustify: IconType;
	export const alignLeft: IconType;
	export const alignRight: IconType;
	export const archive: IconType;
	export const arrowDown: IconType;
	export const arrowLeft: IconType;
	export const arrowRight: IconType;
	export const arrowUp: IconType;
	export const audio: IconType;
	export const button: IconType;
	export const calendar: IconType;
	export const category: IconType;
	export const check: IconType;
	export const chevronDown: IconType;
	export const chevronLeft: IconType;
	export const chevronRight: IconType;
	export const chevronUp: IconType;
	export const classic: IconType;
	export const close: IconType;
	export const code: IconType;
	export const cog: IconType;
	export const column: IconType;
	export const columns: IconType;
	export const comment: IconType;
	export const cover: IconType;
	export const file: IconType;
	export const formatBold: IconType;
	export const formatItalic: IconType;
	export const formatStrikethrough: IconType;
	export const gallery: IconType;
	export const group: IconType;
	export const heading: IconType;
	export const html: IconType;
	export const image: IconType;
	export const keyboardReturn: IconType;
	export const link: IconType;
	export const linkOff: IconType;
	export const list: IconType;
	export const mapMarker: IconType;
	export const mediaAndText: IconType;
	export const menu: IconType;
	export const more: IconType;
	export const moreHorizontal: IconType;
	export const navigation: IconType;
	export const pageBreak: IconType;
	export const paragraph: IconType;
	export const positionCenter: IconType;
	export const positionLeft: IconType;
	export const positionRight: IconType;
	export const pencil: IconType;
	export const plusCircle: IconType;
	export const postList: IconType;
	export const preformatted: IconType;
	export const pullquote: IconType;
	export const quote: IconType;
	export const redo: IconType;
	export const resizeCornerNE: IconType;
	export const rss: IconType;
	export const search: IconType;
	export const separator: IconType;
	export const shortcode: IconType;
	export const stretchFullWidth: IconType;
	export const stretchWide: IconType;
	export const table: IconType;
	export const tag: IconType;
	export const title: IconType;
	export const trash: IconType;
	export const undo: IconType;
	export const update: IconType;
	export const upload: IconType;
	export const verse: IconType;
	export const video: IconType;
	export const widget: IconType;

	export const Icon: Icon;

	export default interface Icons {
		Icon: Icon;

		alignCenter: IconType;
		alignJustify: IconType;
		alignLeft: IconType;
		alignRight: IconType;
		archive: IconType;
		arrowDown: IconType;
		arrowLeft: IconType;
		arrowRight: IconType;
		arrowUp: IconType;
		audio: IconType;
		button: IconType;
		calendar: IconType;
		category: IconType;
		check: IconType;
		chevronDown: IconType;
		chevronLeft: IconType;
		chevronRight: IconType;
		chevronUp: IconType;
		classic: IconType;
		close: IconType;
		code: IconType;
		cog: IconType;
		column: IconType;
		columns: IconType;
		comment: IconType;
		cover: IconType;
		file: IconType;
		formatBold: IconType;
		formatItalic: IconType;
		formatStrikethrough: IconType;
		gallery: IconType;
		group: IconType;
		heading: IconType;
		html: IconType;
		image: IconType;
		keyboardReturn: IconType;
		link: IconType;
		linkOff: IconType;
		list: IconType;
		mapMarker: IconType;
		mediaAndText: IconType;
		menu: IconType;
		more: IconType;
		moreHorizontal: IconType;
		navigation: IconType;
		pageBreak: IconType;
		paragraph: IconType;
		positionCenter: IconType;
		positionLeft: IconType;
		positionRight: IconType;
		pencil: IconType;
		plusCircle: IconType;
		postList: IconType;
		preformatted: IconType;
		pullquote: IconType;
		quote: IconType;
		redo: IconType;
		resizeCornerNE: IconType;
		rss: IconType;
		search: IconType;
		separator: IconType;
		shortcode: IconType;
		stretchFullWidth: IconType;
		stretchWide: IconType;
		table: IconType;
		tag: IconType;
		title: IconType;
		trash: IconType;
		undo: IconType;
		update: IconType;
		upload: IconType;
		verse: IconType;
		video: IconType;
		widget: IconType;
	}
}
