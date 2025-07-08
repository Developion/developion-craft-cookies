import gulp from 'gulp'
import yargs from 'yargs'
import { directoryExists, buildJs, buildCss, copyImages, copyFonts, buildIcons, combineCss, cleanTmp, cleanDist, getAssets } from './.build/gulp.js'
import path from 'path'

// Parse CLI arguments
const { argv } = yargs(process.argv)

// Build an individual asset
const buildAsset = (assetName, mode) => gulp.series(
	gulp.parallel(
		buildJs.bind(null, assetName, mode),
		buildCss.bind(null, assetName, mode),
		copyImages.bind(null, assetName),
		copyFonts.bind(null, assetName),
		buildIcons.bind(null, assetName)
	),
	combineCss.bind(null, assetName, mode),
	cleanTmp,
)

// Watch an individual asset
const watchAsset = (assetName, mode) => {
	const watchPath = path.resolve(`src/Web/Assets/${assetName}/src/**/*`)

	gulp.watch(watchPath, gulp.task(mode))
}

// Development Task
gulp.task('dev', gulp.series(
	() => cleanDist(argv.assetName),
	async () => {
		const assetName = argv.assetName
		const mode = 'dev'

		if (assetName) {
			if (!directoryExists(`src/Web/Assets/${assetName}`)) {
				throw new Error(`Asset "${assetName}" does not exist`)
			}
			await buildAsset(assetName, mode)()
		} else {
			const assets = getAssets()
			if (!assets.length) throw new Error('No assets found')
			await Promise.all(assets.map((asset) => buildAsset(asset, mode)()))
		}
	}
))

// Production Task
gulp.task('prod', gulp.series(
	() => cleanDist(argv.assetName),
	async () => {
		const assetName = argv.assetName
		const mode = 'prod'

		if (assetName) {
			if (!directoryExists(`src/Web/Assets/${assetName}`)) {
				throw new Error(`Asset "${assetName}" does not exist`)
			}
			await buildAsset(assetName, mode)()
		} else {
			const assets = getAssets()
			if (!assets.length) throw new Error('No assets found')
			await Promise.all(assets.map((asset) => buildAsset(asset, mode)()))
		}
	}
))

// Watch Development Task
gulp.task('watch', gulp.series(
	() => cleanDist(argv.assetName),
	async () => {
		const assetName = argv.assetName
		const mode = 'dev'

		if (assetName) {
			if (!directoryExists(`src/Web/Assets/${assetName}`)) {
				throw new Error(`Asset "${assetName}" does not exist`)
			}
			await buildAsset(assetName, mode)()
			watchAsset(assetName, mode)
		} else {
			const assets = getAssets()
			if (!assets.length) throw new Error('No assets found')
			await Promise.all(assets.map((asset) => buildAsset(asset, mode)()))
			assets.forEach((asset) => watchAsset(asset, mode))
		}
	}
))

// Watch Production Task
gulp.task('watch-prod', gulp.series(
	() => cleanDist(argv.assetName),
	async () => {
		const assetName = argv.assetName
		const mode = 'prod'

		if (assetName) {
			if (!directoryExists(`src/Web/Assets/${assetName}`)) {
				throw new Error(`Asset "${assetName}" does not exist`)
			}
			await buildAsset(assetName, mode)()
			watchAsset(assetName, mode)
		} else {
			const assets = getAssets()
			if (!assets.length) throw new Error('No assets found')
			await Promise.all(assets.map((asset) => buildAsset(asset, mode)()))
			assets.forEach((asset) => watchAsset(asset, mode))
		}
	}
))
