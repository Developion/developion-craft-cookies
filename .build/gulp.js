import gulp from 'gulp'
import through2 from 'through2'
import rollupStream from '@rollup/stream'
import source from 'vinyl-source-stream'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser'
import postcss from 'rollup-plugin-postcss'
import postcssImport from 'postcss-import'
import * as sassModule from 'sass'
import gulpSass from 'gulp-sass'
import cleanCSS from 'gulp-clean-css'
import iconfont from 'gulp-iconfont'
import consolidate from 'gulp-consolidate'
import gulpIf from 'gulp-if'
import sourcemaps from 'gulp-sourcemaps'
import { glob } from 'glob'
import mergeStream from 'merge-stream'
import gulpConcat from 'gulp-concat'
import gulpRename from 'gulp-rename'
import fs from 'fs'
import path from 'path'
import { deleteAsync as del, deleteSync } from 'del'

const sass = gulpSass(sassModule)

// Get all asset names
export const getAssets = () => {
	try {
		return fs.readdirSync('src/Web/Assets')
			.filter((file) => fs.statSync(path.join('src/Web/Assets', file)).isDirectory())
	} catch {
		return []
	}
}

// Check if a directory exists
export const directoryExists = (dirPath) => {
	try {
		return fs.statSync(dirPath).isDirectory()
	} catch {
		return false
	}
}

export const cleanDist = async (assetName) => {
	if (assetName) {
		del([`public/${assetName}/dist/css/home.css`])
	} else {
		const assets = getAssets()
		if (!assets.length) throw new Error('No assets found')
		Promise.all(assets.map((asset) => del([`public/${asset}/dist/css/home.css`])))
	}
}

export const cleanTmp = () => {
	return del(['.tmp'])
}

// Build JavaScript with Rollup
export const buildJs = (assetName, mode) => {
	const jsDir = `src/Web/Assets/${assetName}/src/js`
	if (!directoryExists(jsDir)) return Promise.resolve()

	return gulp.src(`${jsDir}/**/*.js`, { base: `src/Web/Assets/${assetName}/src` })
		.pipe(through2.obj(function (file, enc, cb) {
			const subDir = path.dirname(file.relative).slice(3) // Remove 'js/'
			const cssFileName = `${path.basename(file.path, '.js')}.fromJs.css` // Suffix for JS origin
			const cssOutputPath = path.join('.tmp', 'css', assetName, subDir, cssFileName)

			rollupStream({
				input: file.path,
				plugins: [
					postcss({
						extract: cssOutputPath,
						loader: (code, id) => {
							if (id.endsWith('.scss')) {
								const result = sassModule.renderSync({ file: id })
								return result.css.toString()
							}
							return code
						},
						plugins: [postcssImport()],
					}),
					nodeResolve(),
					commonjs(),
					mode === 'prod' ? terser() : null,
				].filter(Boolean),
				output: {
					name: path.basename(file.path, '.js'),
					extend: true,
					format: 'iife',
					sourcemap: mode === 'dev',
				},
			})
				.pipe(source(file.relative))
				.pipe(gulp.dest(`public/${assetName}/dist`))
				.on('end', cb)
				.on('error', cb)
		}))
}

export const buildCss = (assetName, mode) => {
	const scssDir = `src/Web/Assets/${assetName}/src/scss`
	if (!directoryExists(scssDir)) return Promise.resolve()

	return gulp.src([`${scssDir}/**/*.scss`, `!${scssDir}/**/_*.scss`], { base: scssDir })
		.pipe(gulpIf(mode === 'prod', sourcemaps.init()))
		.pipe(sass().on('error', sass.logError))
		.pipe(gulpIf(mode === 'prod', sourcemaps.write('.')))
		.pipe(gulpRename((path) => {
			path.basename += '.fromScss'
		}))
		.pipe(gulp.dest(`.tmp/css/${assetName}`))
}

export const combineCss = (assetName, mode) => {
	const tmpDir = `.tmp/css/${assetName}`
	const files = glob.sync(`${tmpDir}/**/*.css`, { nodir: true })
	const groups = {}

	files.forEach((file) => {
		const relative = path.relative(tmpDir, file)
		const parts = relative.split(path.sep)
		const fileName = parts.pop()
		const dir = parts.join(path.sep)
		const baseName = fileName.replace(/\.from.*\.css$/, '.css')
		const intendedPath = path.join(dir, baseName)
		if (!groups[intendedPath]) groups[intendedPath] = []
		groups[intendedPath].push(file)
	})
	const tasks = Object.entries(groups).map(([intendedPath, sources]) => {
		const outputDir = path.join('public', assetName, 'dist', 'css', path.dirname(intendedPath))
		const outputFile = path.basename(intendedPath)
		return gulp.src(sources)
			.pipe(gulpConcat(outputFile))
			.pipe(gulpIf(mode === 'prod', cleanCSS()))
			.pipe(gulp.dest(outputDir))
	})

	return mergeStream(tasks)
}

// Copy Images
export const copyImages = (assetName) => {
	const imagesDir = `src/Web/Assets/${assetName}/src/images`
	if (!directoryExists(imagesDir)) return Promise.resolve()

	return gulp.src(`${imagesDir}/**/*`, { base: `src/Web/Assets/${assetName}/src` })
		.pipe(gulp.dest(`public/${assetName}/dist`))
}

// Copy Fonts
export const copyFonts = (assetName) => {
	const fontsDir = `src/Web/Assets/${assetName}/src/fonts`
	if (!directoryExists(fontsDir)) return Promise.resolve()

	return gulp.src(`${fontsDir}/**/*`, { base: `src/Web/Assets/${assetName}/src` })
		.pipe(gulp.dest(`public/${assetName}/dist`))
}

// Build SVG Icons into Icon Font
export const buildIcons = (assetName) => {
	const iconsDir = `src/Web/Assets/${assetName}/src/icons`
	if (!directoryExists(iconsDir)) return Promise.resolve()

	const fontName = 'icons'
	let glyphs

	const generateFont = () =>
		gulp.src(`${iconsDir}/*.svg`)
			.pipe(iconfont({
				fontName,
				formats: ['woff', 'woff2'],
				normalize: true,
				fontHeight: 1001,
			}))
			.on('glyphs', (glyphData) => {
				glyphs = glyphData // Store glyphs for CSS generation
			})
			.pipe(gulp.dest(`public/${assetName}/dist/fonts`))

	const generateCSS = () =>
		gulp.src('.build/icons.css')
			.pipe(consolidate('lodash', {
				glyphs,
				fontName,
				fontPath: '../fonts/',
				className: 'icon',
			}))
			.pipe(gulp.dest(`public/${assetName}/dist/css`))

	return new Promise((resolve, reject) => {
		generateFont()
			.on('end', () => {
				generateCSS()
					.on('end', resolve)
					.on('error', reject)
			})
			.on('error', reject)
	})
}
