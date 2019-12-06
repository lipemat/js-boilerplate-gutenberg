declare module '@wordpress/data' {
	import {Taxonomy} from '@wordpress/api/taxonomies';
	import {Settings} from '@wordpress/api/settings';
	import {Type} from '@wordpress/api/types';
	import {Media} from '@wordpress/api/media';

	import {ComponentType} from 'react';

	type select = <Result>( store: string ) => {
		getMedia: ( id: number ) => Media;
		getMediaItems: () => Media[];
		getPostType: ( slug: string ) => Type;
		getSite: () => Settings;
		getTaxonomy: ( slug: string ) => Taxonomy;
		getTaxonomies: () => Taxonomy[];

		// @todo properly type the rest of these as needed.
		canUser: ( capability: string ) => boolean;
		getIsResolving: () => boolean;
		getAuthors: () => any;
		getAutosave: ( id: string ) => any;
		getAutosaves: () => any;
		getCachedResolvers: () => any;
		getCurrentUser: () => any;
		getEmbedPreview: ( id: number ) => any;
		getLastEntitySaveError: () => any;
		getPostTypes: ( slug: string ) => any;
		getRawEntityRecord: () => any;
		getRedoEdit: () => any;
		getReferenceByDistinctEdits: () => any;
		getThemeSupports: ( support: string ) => any;
		getUndoEdit: () => any;
		getUserQueryResults: () => any;
		getWidgetArea: ( slug: string ) => any;
		getWidgetAreas: () => any;
		hasFetchedAutosaves: () => boolean;
		hasFinishedResolution: () => boolean;
		hasRedo: () => boolean;
		hasStartedResolution: () => boolean;
		hasUndo: () => boolean;
		hasUploadPermissions: () => boolean;
		isAutosavingEntityRecord: () => boolean;
		isPreviewEmbedFallback: () => boolean;
		isRequestingEmbedPreview: () => boolean;
		isResolving: () =>boolean;
		isSavingEntityRecord: () =>boolean;
		[ selector: string ]: ( key?: string | number ) => Result | any;
	}

	export type useSelect = <T>( callback: ( select: select ) => T, deps?: Array<any> ) => T;
	export type useDispatch = <T>( storeName: string ) => ( newValue: any ) => void;
	export type withDispatch = <T>( callback: ( dispatch: any, ownProps: object, {select: select} ) => T, component: ComponentType<T> ) => ComponentType<T>;
	export type withSelect = <T>( callback: ( callback: ( select: select ) => T, ownProps: object ) => T, component: ComponentType<T> ) => ComponentType<T>;

	export const select: select;
	export const useDispatch: useDispatch;
	export const useSelect: useSelect;
	export const withDispatch: withDispatch;
	export const withSelect: withSelect;

	export default interface Data {
		select: select;
		useDispatch: useDispatch;
		useSelect: useSelect;
	}
}
