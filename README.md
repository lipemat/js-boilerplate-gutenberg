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

Due to requirements created by Yarn [PNP](https://yarnpkg.com/features/pnp), the Gutenberg type definitions have been moved to an [outside library](https://github.com/lipemat/-types-lipemat-gutenberg) and will be maintained there.

If you are not using PNP, the definitions are included in this package's `package.json` so there are no additional steps to use them.

If you are using PNP you may add the definitions to your `package.json` like so.

```JSON 
"dependencies": {
    "@types/lipemat-js-boilerplate": "lipemat/types-js-boilerplate#semver:^1.0.0"
  }
```


