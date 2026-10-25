//<gulpfile.js>

//-- VARIAVEIS
var gulp = require('gulp'),
	browserSync = require('browser-sync'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	less = require('gulp-less'),
	path = require('path'),
	autoprefixer = require('gulp-autoprefixer'),
	minifyCSS = require('gulp-cssnano'),
	minifyHTML = require('gulp-htmlmin'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	concat = require('gulp-concat'),
	concatCss = require('gulp-concat-css'),
	gulpif = require('gulp-if'),
	LessPluginCleanCSS = require('less-plugin-clean-css'),
    LessPluginAutoPrefix = require('less-plugin-autoprefix'),
    cleancss = new LessPluginCleanCSS({ advanced: true }),
    autoprefix = new LessPluginAutoPrefix({ browsers: ["last 2 versions"] }),
    shell = require('gulp-shell');

// -- ARGUMENTOS
var args = require('yargs')
	.default('production', false)
	.alias('p', 'production')
	.argv;

	var isProduction = args.production;


// <TASKS>



// --STYLES

	// MAIN
	gulp.task('styles:main', function () {
	  return gulp.src('./sources/less/main.less')
	    .pipe(less())
	    .pipe(gulpif(isProduction, less({plugins: [autoprefix, cleancss]})))
	    .pipe(gulp.dest('./assets/css'))
	    .pipe(browserSync.reload({stream:true}))
	});

	// VENDORS
	gulp.task('styles:vendors', function () {
		var src = [
			'./bower_components/bootstrap-css/css/bootstrap.min.css',
		];
	  return gulp.src(src)
	    .pipe(concatCss('vendors.css'))
	  	.pipe(gulpif(isProduction, minifyCSS()))
	    .pipe(gulp.dest('./assets/css'))
	});


	gulp.task('styles', ['styles:main','styles:vendors']);



// --SCRIPTS


	// MAIN
	gulp.task('scripts:main', function() {
		var src = [
			'./sources/js/main.js',
			'./sources/js/processaCadastro.js',
		];
		return gulp.src(src)
	    .pipe(concat('app.js'))
	    .pipe(gulpif(isProduction, uglify()))
	    .pipe(gulp.dest('./assets/js'))
	    .pipe(browserSync.reload({stream:true}))
	});
	
	// VENDORS
	gulp.task('scripts:vendors', function() {
		var src = [
			'./bower_components/jquery/dist/jquery.min.js',
			'./bower_components/bootstrap-css/js/bootstrap.min.js',
			'./bower_components/jquery-breakpoint-check/js/jquery-breakpoint-check.min.js',
			'./sources/js/jqBootstrapValidation.js',
		];

		return gulp.src(src)
	    .pipe(concat('vendors.js'))
	    .pipe(gulpif(isProduction, uglify()))
	    .pipe(gulp.dest('./assets/js'))
	});

	gulp.task('scripts', ['scripts:main','scripts:vendors']);



// --COPY
	// IMAGES
	gulp.task('copy:images', function () {
	    return gulp.src('./sources/images/**/*.{jpg,png,gif,svg}')
	        .pipe(gulpif(isProduction, imagemin({
		            progressive: true,
		            svgoPlugins: [{removeViewBox: false}],
		            use: [pngquant()]
	        	})))
	        .pipe(gulp.dest('./assets/images'));
	});

	// FONTS
	gulp.task('copy:fonts', function () {
		var extensions = '{eot,svg,ttf,woff,woff2}'
		var src = [
		'./bower_components/bootstrap-css/fonts/*.' + extensions,
		'./sources/fonts/*.' + extensions,
		]

	  return gulp.src(src)
	    .pipe(gulp.dest('./assets/fonts'))
	});

	// PHP
	gulp.task('copy:php', function () {
		return gulp.src('./sources/php/**/*.php')
	    .pipe(gulp.dest('./assets/php'))
	});

	gulp.task('copy', ['copy:images', 'copy:fonts', 'copy:php']);


// -- HMTL
	gulp.task('html', function() {
	  return gulp.src('./sources/html/*.html')
	  	.pipe(gulpif(isProduction, minifyHTML({collapseWhitespace: true})))
	    .pipe(gulp.dest('./assets'))
	    .pipe(browserSync.reload({stream:true}))
	});

	// Task for building blog when something changed:
	//gulp.task('jekyll', shell.task(['bundle exec jekyll build --source ./sources/jekyll/ --destination ./build_/']));
	// Or if you don't use bundle:
	gulp.task('jekyll', shell.task(['jekyll build --destination ./_build/ --incremental']));



// * * EXECUÇÃO

	
	// --BROWSER SYNC
	gulp.task('browser-sync', ['jekyll'], function() {
	  browserSync({
	    server: {
	      baseDir: "./_build"
	    }
	  });
	});

	// --WATCH
	gulp.task('watch', function () {
		var onChange = function(event){
			console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
		}

	   gulp.watch('./**/*.html', ['jekyll']).on('change', browserSync.reload);
	   gulp.watch('./sources/less/**/*.less', ['styles:main','jekyll']).on('change',onChange);
	   gulp.watch('./sources/js/**/*.js', ['scripts:main','jekyll']).on('change',onChange);
	   gulp.watch('./sources/images/**/*.{jpg,png,gif,svg}', ['copy:images','jekyll']).on('change',onChange);
	   gulp.watch('./sources/php/**/*.php', ['copy:php','jekyll']).on('change',onChange);
	   //gulp.watch('./sources/html/*.html', ['html']).on('change',onChange);
	});

	// --START
	gulp.task('start', ['watch', 'browser-sync']);

	// --DEFAULT
	gulp.task('default', ['styles', 'scripts', 'copy']);