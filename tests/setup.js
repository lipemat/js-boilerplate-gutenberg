import 'core-js/stable';
import 'regenerator-runtime/runtime';

// eslint-disable-next-line no-undef
jest.spyOn( global.console, 'warn' ).mockImplementation( () => jest.fn() );

let __cookies;
Object.defineProperty( window.document, 'cookie', {
	get: () => __cookies,
	set: v => __cookies = v,
	slit: s => __cookies.split( s ),
} );

// Mock environmental variables
global.__TEST__ = true;
window.CORE_CONFIG = {
	endpoint: {
		actions: [],
		ajaxURL: 'http://starting-point.loc/wp-admin/admin-ajax.php',
		nonce: null,
		root: 'http://starting-point.loc/wp-json/',
	},
};
