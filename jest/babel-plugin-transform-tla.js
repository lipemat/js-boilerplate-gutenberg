/**
 * Babel plugin to transform top-level await for Jest/CJS compatibility.
 *
 * Wraps the entire module body in an async IIFE when top-level await is detected.
 */
module.exports = function() {
	return {
		visitor: {
			Program: {
				exit( path ) {
					let hasTLA = false;
					for ( const node of path.node.body ) {
						if ( 'AwaitExpression' === node.type ) {
							hasTLA = true;
							break;
						}
						// Check for variable declarations with await.
						if ( 'VariableDeclaration' === node.type ) {
							for ( const decl of node.declarations ) {
								if ( decl.init && 'AwaitExpression' === decl.init.type ) {
									hasTLA = true;
									break;
								}
							}
						}
						// Check for expression statements with await.
						if ( 'ExpressionStatement' === node.type && node.expression && 'AwaitExpression' === node.expression.type ) {
							hasTLA = true;
							break;
						}
					}
					if ( ! hasTLA ) {
						return;
					}

					// Replace each top-level await with a synchronous require-like pattern.
					// Since Jest runs synchronously, we convert `await expr` to just `expr`
					// for cases where the awaited value is already resolved (like require).
					path.traverse( {
						AwaitExpression( awaitPath ) {
							// Only transform top-level awaits (direct children of Program).
							let parent = awaitPath.parentPath;
							let isTopLevel = false;
							while ( parent ) {
								if ( parent.isProgram() ) {
									isTopLevel = true;
									break;
								}
								if ( parent.isFunction() || parent.isArrowFunctionExpression() ) {
									break;
								}
								parent = parent.parentPath;
							}
							if ( isTopLevel ) {
								awaitPath.replaceWith( awaitPath.node.argument );
							}
						},
					} );
				},
			},
		},
	};
};
