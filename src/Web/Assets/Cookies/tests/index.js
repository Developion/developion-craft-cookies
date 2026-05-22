import { Tokens as TokensDll, icons } from '../src/index.js';
import Tokens from '../src/tokens.js';

import ckeditor from './../theme/icons/ckeditor.svg';

describe( 'CKEditor5 Tokens DLL', () => {
	it( 'exports Tokens', () => {
		expect( TokensDll ).to.equal( Tokens );
	} );

	describe( 'icons', () => {
		it( 'exports the "ckeditor" icon', () => {
			expect( icons.ckeditor ).to.equal( ckeditor );
		} );
	} );
} );
