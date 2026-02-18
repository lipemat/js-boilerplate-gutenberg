# Source Files

Some files cannot be TS because JEST will fail to load them when they are included in the JEST configuration generation.

As part of the build process, JS versions of the TS files are generated in the following directories.
- config
- helpers
- lib

The tsconfig.json in this directory is used to generate the JS files.
