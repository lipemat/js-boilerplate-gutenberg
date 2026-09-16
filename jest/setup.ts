import fetch from 'cross-fetch';
import {existsSync, readFileSync} from 'fs';
import {globalAgent} from 'https';
import {rootCertificates} from 'tls';
import {parseEnv} from 'util';

global.fetch = fetch;

// Local credentials for tests which require authentication.
const ENV_FILE = new URL( '.env.local', import.meta.url );
if ( existsSync( ENV_FILE ) ) {
	Object.assign( process.env, parseEnv( readFileSync( ENV_FILE, 'utf8' ) ) );
}

// Trust the local site's self-signed certificate in addition to the default CAs.
const CA_CERT = process.env.JEST_CA_CERT ?? '';
if ( '' !== CA_CERT ) {
	globalAgent.options.ca = [ ...rootCertificates, readFileSync( CA_CERT, 'utf8' ) ];
}
