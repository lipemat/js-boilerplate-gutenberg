declare module '@wordpress/components' {
	import {ComponentType, InputHTMLAttributes, ReactNode, SelectHTMLAttributes} from 'react';

	export type colorOptions = Array<{
		color: string;
		name: string;
		slug?: string;
	}>;

	interface CheckboxControl extends Omit<InputHTMLAttributes<{}>, 'onChange'> {
		heading?: string;
		label?: string;
		help?: string;
		checked: boolean;
		className?: string,
		onChange: ( currentValue: boolean ) => void;
	}

	interface ColorPalette {
		//	disableAlpha?: boolean; // Not available in WP Core yet as of 2019-8-11 96f7d3497e518
		className?: string;
		clearable?: boolean
		disableCustomColors: boolean;
		label: string;
		onChange: ( currentValue: string ) => void;
		value: string;
	}

	interface ColorPicker {
		disableAlpha: boolean;
		className: string;
		onChangeComplete: ( currentValue: string ) => void;
	}

	interface PanelBody {
		title: string;
		initialOpen?: boolean;
		icon?: string
		children?: ReactNode[] | ReactNode;
	}

	interface SelectControl extends Omit<SelectHTMLAttributes<{}>, 'onChange'> {
		help?: string;
		label?: string;
		multiple?: boolean;
		onChange: ( currentValue: string ) => void;
		options?: Array<{
			label: string;
			value: string;
			disabled?: boolean
		}>;
		className?: string,
		hideLabelFromVision?: boolean
	}

	export interface ServerSideRender {
		block: string;
		attributes?: object;
		className?: string;
	}

	interface TextControl extends Omit<InputHTMLAttributes<{}>, 'onChange' | 'onKeyPress'> {
		label?: string;
		help?: string;
		hideLabelFromVision?: boolean
		value: string | number;
		className?: string,
		onChange: ( currentValue: string ) => void;
		onKeyPress?: ( ev: KeyboardEvent ) => void;
		type?: string;
	}

	export interface withSpokenMessages {
		speak?: ( message: string, ariaLive?: 'polite' | 'assertive' ) => void;
		debouncedSpeak?: ( message: string, ariaLive?: 'polite' | 'assertive' ) => void;
	}

	export const CheckboxControl: ComponentType<CheckboxControl>;
	export const ColorPalette: ComponentType<ColorPalette>;
	export const ColorPicker: ComponentType<ColorPicker>;
	export const PanelBody: ComponentType<PanelBody>;
	export const SelectControl: ComponentType<SelectControl>;
	export const ServerSideRender: ComponentType<ServerSideRender>;
	export const Spinner: ComponentType<{}>;
	export const TextControl: ComponentType<TextControl>;

	export default interface Components {
		CheckboxControl: ComponentType<CheckboxControl>
		ColorPalette: ComponentType<ColorPalette>;
		ColorPicker: ComponentType<ColorPicker>;
		PanelBody: ComponentType<PanelBody>;
		SelectControl: ComponentType<SelectControl>;
		ServerSideRender: ComponentType<ServerSideRender>;
		Spinner: ComponentType<{}>;
		TextControl: ComponentType<TextControl>;
	}
}

