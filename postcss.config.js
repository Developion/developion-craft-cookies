module.exports = {
	plugins: [
		require('postcss-mixins'),
		require('postcss-import'),
		require('postcss-logical'),
		require('autoprefixer')({
			flexbox: 'no-2009',
		}),
	],
}
