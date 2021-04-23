## WordPress/Gutenberg extension for [@lipemat/js-boilerplate](https://github.com/lipemat/js-boilerplate) for zero configuration [Gutenberg](https://github.com/WordPress/gutenberg) support.

<p>
<a href="https://www.npmjs.com/package/@lipemat/js-boilerplate-gutenberg">
<img alt="npm" src="https://img.shields.io/npm/v/@lipemat/js-boilerplate-gutenberg.svg">
</a>

 <img alt="node" src="https://img.shields.io/node/v/@lipemat/js-boilerplate-gutenberg.svg">
</p>

### Installation
```bash
yarn add @lipemat/js-boilerplate-gutenberg
```

### TypeScript

This package is completely built in TypeScript and supports native JavaScript or TypeScript applications.

#### Gutenberg definitions

Due to requirements created by Yarn [PNP](https://yarnpkg.com/features/pnp), the Gutenberg definitions have been moved to an [external package](https://github.com/lipemat/types-js-boilerplate) and will be maintained there.

If you are not using PNP, the definitions are included in this package's `package.json` so there are no additional steps to use them.

If you are using PNP you may add the definitions to your `package.json` like so.

```JSON 
"dependencies": {
    "@types/lipemat__js-boilerplate": "lipemat/types-js-boilerplate#semver:^1.0.0"
  }
```

### Application Passwords

As of WordPress 5.6, support for [application passwords](https://make.wordpress.org/core/2020/11/05/application-passwords-integration-guide) is available on all SSL sites. Prior to 5.6 application passwords may be enabled via the [application passwords plugin](https://github.com/wordpress/application-passwords).

Helper functions are available for interacting with the application passwords system.
```javascript
import {setRootURL, wpapi, enableApplicationPassword, getAuthorizationUrl} from '@lipemat/js-boilerplate-gutenberg';

// Point the REST API at an external site.
setRootURL( 'https://starting-point.dev/wp-json/' );

// Retrieve the URL to redirect your users to for authorization.
const URL = await getAuthorizationUrl({
    app_name: 'Test Application'
});

// Add an application password to all subsequent requests.
enableApplicationPassword( 'test', 'nnXX zPX6 5Fqc 21tG zLH0 Rtep' );

// Request will be authenticated.
const post = await wp.posts().create( {
	title: 'Test Post',
} );

```

### Hot Module Reloading For Blocks and Plugins

Helper methods exists for automatically loading block or plugin files based on a `REGEX` filter as well as handling the various `register` and `unregister` requirements to make HMR work. 

```typescript
import {autoloadBlocks, autoloadPlugins} from '@lipemat/js-boilerplate-gutenberg';

/**
 * Use our custom autoloader to automatically require,
 * register and add HMR support to Gutenberg related items.
 *
 * Will load from specified directory recursively.
 */
export default () => {
	// Load all blocks
	autoloadBlocks( () => require.context( './blocks', true, /block\.tsx$/ ), module );

	// Load all meta boxes
	autoloadPlugins( () => require.context( './meta-boxes', true, /index\.tsx$/ ), module );

}
````

### Hooks

#### `usePostMeta`

`usePostMeta` is used to interact with the current post's meta from sidebars or meta boxes within Gutenberg.

Will return the current meta state as well as the original meta state before any changes were made.

You may work with a single meta key like so:
```typescript
const [value, updateValue, previous] = usePostMeta( 'custom-meta-key' );
```
Or by default work with the whole meta object:
```typescript
const [values, updateValues, previous] = usePostMeta();
```

#### `useTerms`

`useTerms` is used to interact with the current post's terms from sidebars or meta boxes within Gutenberg.

Will return the current terms state as well as the original terms state before any changes were made.


```typescript
const [terms, updateTerms, previous] = useTerms( 'category' );
```
