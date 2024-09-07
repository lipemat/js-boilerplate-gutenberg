import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'unfetch/polyfill';

jest.spyOn( global.console, 'warn' ).mockImplementation( () => jest.fn() );
jest.spyOn( global.console, 'error' ).mockImplementation( () => jest.fn() );

// Mock environmental variables
global.__TEST__ = true;
