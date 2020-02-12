/**
 * Definitions for the `@wordpress/primitives` package.
 *
 * Currently not available as a global variable and must
 * be used from the package directly.
 *
 * @link https://www.npmjs.com/package/@wordpress/primitives
 *
 * @todo Adjust configurations to use webpack external and remove
 *       direct package access and package.json dependency
 *       when available in WP Core.
 */
declare module '@wordpress/primitives' {
	import {SVGAttributes} from 'react';
	import {ClassValue} from 'classnames/types';

	interface BlockQuotation extends HTMLQuoteElement {
	}

	interface HorizontalRule extends HTMLHRElement {
	}

	interface Circle extends React.SVGProps<SVGCircleElement> {
	}

	interface G extends React.SVGProps<SVGGElement> {
	}

	interface Path extends React.SVGProps<SVGPathElement> {
	}

	interface Polygon extends React.SVGProps<SVGPolygonElement> {
	}

	interface Rect extends React.SVGProps<SVGRectElement> {
	}

	interface Defs extends React.SVGProps<SVGDefsElement> {
	}

	interface RadialGradient extends React.SVGProps<SVGRadialGradientElement> {
	}

	interface LinearGradient extends React.SVGProps<SVGLinearGradientElement> {
	}

	interface Stop extends React.SVGProps<SVGStopElement> {
	}

	interface SVG extends Omit<SVGAttributes<SVGElement>, 'className'> {
		className?: ClassValue;
		isPressed?: boolean;
	}

	export const BlockQuotation: BlockQuotation;
	export const Circle: Circle;
	export const Defs: Defs;
	export const G: G;
	export const HorizontalRule: HorizontalRule;
	export const LinearGradient: LinearGradient;
	export const Path: Path;
	export const Polygon: Polygon;
	export const RadialGradient: RadialGradient;
	export const Rect: Rect;
	export const SVG: SVG;
	export const Stop: Stop;

	export default interface Primitives {
		BlockQuotation: BlockQuotation;
		Circle: Circle;
		Defs: Defs;
		G: G;
		HorizontalRule: HorizontalRule;
		LinearGradient: LinearGradient;
		Path: Path;
		Polygon: Polygon;
		RadialGradient: RadialGradient;
		Rect: Rect;
		SVG: SVG;
		Stop: Stop;
	}


}
