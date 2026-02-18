import type {Config} from 'jest';
import {resolve} from 'path';
import {fileURLToPath} from 'url';

import config from '@lipemat/js-boilerplate-shared/config/jest.config.js';

const __dirname = fileURLToPath( new URL( '.', import.meta.url ) );

const jestConfig: Config = config;
jestConfig.testEnvironment = 'jsdom';

// Add a top-level await transform plugin for Jest/CJS compatibility.
// @todo Figure out a proper solution for this instead of this hack
//       on the next major testing change.
if ( jestConfig.transform ) {
	const key = Object.keys( jestConfig.transform )[ 0 ];
	const transformConfig = jestConfig.transform[ key ] as [ string, { plugins: string[] } ];
	transformConfig[ 1 ].plugins.push( resolve( __dirname, 'babel-plugin-transform-tla.js' ) );
}

export default jestConfig;
