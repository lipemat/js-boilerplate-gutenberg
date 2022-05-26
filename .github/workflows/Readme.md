## GitHub Action Setup

Add a [secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets#creating-encrypted-secrets-for-a-repository) used for NPM publishing.
* Name: `NPM_TOKEN`
* Value: From "Access Tokens" settings in NPM profile (or CRM stored one).

## Auto Publish
* The `publish.yml` publishes new releases.
* The `publish-beta.yml` publishes new beta versions.
