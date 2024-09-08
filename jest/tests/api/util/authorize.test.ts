import {clearApplicationPassword, enableApplicationPassword, getAuthorizationUrl, hasApplicationPassword, setRootURL, wpapi} from '../../../../src';
import type {ErrorResponse} from '../../../../src/util/parse-response';

describe( 'Testing authorize', () => {
	const wp = wpapi( '' );
	const PASSWORD = 'J3wb fq94 xlqk YdGI my9E 8egk';

	beforeEach( () => {
		setRootURL( 'http://starting-point.loc/wp-json/' );
		clearApplicationPassword();
	} );

	it( 'Test application passwords URL', async () => {
		setRootURL( 'http://starting-point.loc/wp-json/' );
		const url = await getAuthorizationUrl( {
			app_id: '92ee9ae3-6f64-4234-9856-f9c863af5916',
			app_name: 'Jest Unit Test',
			reject_url: 'https://starting-point.loc/fail',
			success_url: 'https://starting-point.loc/success',
		} );
		expect( url ).toBe( 'https://starting-point.loc/wp-admin/authorize-application.php?app_id=92ee9ae3-6f64-4234-9856-f9c863af5916&app_name=Jest+Unit+Test&reject_url=https%3A%2F%2Fstarting-point.loc%2Ffail&success_url=https%3A%2F%2Fstarting-point.loc%2Fsuccess' );
	} );

	it( 'Test clear of application password', async () => {
		expect( hasApplicationPassword() ).toBeFalsy();
		enableApplicationPassword( 'test', PASSWORD );
		expect( hasApplicationPassword() ).toBeTruthy();
		clearApplicationPassword();
		expect( hasApplicationPassword() ).toBeFalsy();
	} );


	it( 'Test CRUD', async () => {
		jest.setTimeout( 10000 );
		enableApplicationPassword( 'test', PASSWORD );

		const post = await wp.posts().create( {
			title: 'From JS Unit',
			status: 'publish',
		} );
		expect( post ).toStrictEqual( await wp.posts().getById( post.id, {context: 'edit'} ) );

		const result = await wp.posts().update( {
			id: post.id,
			content: 'XXXX',
			title: 'TTTT',
		} );
		expect( result.title.raw ).toBe( 'TTTT' );
		expect( result.content.raw ).toBe( 'XXXX' );
		const updated = await wp.posts().getById( post.id );
		expect( updated.content.rendered ).toBe( '<p>XXXX</p>\n' );

		const trash = await wp.posts().trash( post.id );
		expect( trash.status ).toBe( 'trash' );
		expect( trash.id ).toBe( post.id );
		const trashed = await wp.posts().getById( post.id );
		expect( trashed.id ).toBe( post.id );
		expect( trashed.status ).toBe( 'trash' );

		const deleted = await wp.posts().delete( trashed.id );
		expect( deleted.deleted ).toBeTruthy();
		expect( deleted.previous.id ).toBe( trashed.id );
		let error;
		try {
			await wp.posts().getById( trashed.id );
		} catch ( e ) {
			error = e;
		}

		clearApplicationPassword();
		try {
			await wp.posts().create( {
				title: 'From JS Unit',
				status: 'publish',
			} );
		} catch ( e ) {
			error = e as ErrorResponse;
			expect( error.code ).toBe( 'rest_cannot_create' );
		}
	} );
} );
