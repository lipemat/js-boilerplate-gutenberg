import ApiFetch from '@wordpress/api-fetch';
import BlockEditor from '@wordpress/block-editor';
import Blocks from '@wordpress/blocks';
import Components, {ServerSideRender} from '@wordpress/components';
import Compose from '@wordpress/compose';
import Data from '@wordpress/data';
import Editor from '@wordpress/editor';
import Element from '@wordpress/element';
import Hooks from '@wordpress/hooks';
import I18N from '@wordpress/i18n';
import URL from '@wordpress/url';

/**
 * Available in the WordPress Admin
 *
 * @todo Declare further levels.
 */
export const apiFetch: ApiFetch;
export const blocks: Blocks;
export const blockEditor: BlockEditor;
export const components: Components;
export const compose: Compose;
export const data: Data;
export const date: object;
export const editor: Editor;
export const element: Element;
export const hooks: Hooks;
export const i18n: I18N;
export {ServerSideRender} from '@wordpress/components';
export const utils: object;
export const url: URL;
