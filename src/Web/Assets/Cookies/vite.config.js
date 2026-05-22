import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		minify: 'terser', // Force Terser instead of esbuild
		terserOptions: {
			compress: {
				drop_console: true, // Optional: Removes console.logs
				drop_debugger: true,
			},
			format: {
				comments: false, // Removes all comments
			},
		},
		lib: {
			entry: resolve(__dirname, 'src/cookies.js'),
			name: 'Cookies',
			fileName: () => 'cookies.js',
			formats: ['es'],
		},
		rollupOptions: {
			external: ['ckeditor5'],
		},
	},
	assetsInclude: ['**/*.svg'],
})
