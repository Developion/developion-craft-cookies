import { Cookies as CookiesDll, icons } from '../src/index.js';
import Cookies from '../src/cookies.js';

import ckeditor from './../theme/icons/ckeditor.svg';

describe( 'CKEditor5 Cookies DLL', () => {
	it( 'exports Cookies', () => {
		expect( CookiesDll ).to.equal( Cookies );
	} );

	describe( 'icons', () => {
		it( 'exports the "ckeditor" icon', () => {
			expect( icons.ckeditor ).to.equal( ckeditor );
		} );
	} );
} );
