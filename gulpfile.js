'use strict';

var gulp = require('gulp'),
	watch = require('gulp-watch'),
	prefixer = require('gulp-autoprefixer'),
	uglify = require('gulp-uglify'),
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	rigger = require('gulp-rigger'),
	cssmin = require('gulp-clean-css'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	rimraf = require('rimraf'),
	browserSync = require("browser-sync"),
	reload = browserSync.reload;

var path = {
	gh-pages: { //Тут мы укажем куда складывать готовые после сборки файлы
		html: 'gh-pages/',
		js: 'gh-pages/js/',
		css: 'gh-pages/css/',
		img: 'gh-pages/img/',
		fonts: 'gh-pages/fonts/'
	},
	src: { //Пути откуда брать исходники
		html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
		js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
		style: 'src/style/main.scss',
		img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
		fonts: 'src/fonts/**/*.*'
	},
	watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
		html: 'src/**/*.html',
		js: 'src/js/**/*.js',
		style: 'src/style/**/*.scss',
		img: 'src/img/**/*.*',
		fonts: 'src/fonts/**/*.*'
	},
	clean: './gh-pages'
};

var config = {
	server: {
		baseDir: "./gh-pages"
	},
	tunnel: true,
	host: 'localhost',
	port: 9000,
	logPrefix: "Frontend_Devil"
};

gulp.task('html:gh-pages', function () {
	gulp.src(path.src.html) //Выберем файлы по нужному пути
		.pipe(rigger()) //Прогоним через rigger
		.pipe(gulp.dest(path.gh-pages.html)) //Выплюнем их в папку gh-pages
		.pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('js:gh-pages', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.gh-pages.js)) //Выплюнем готовый файл в gh-pages
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

gulp.task('style:gh-pages', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.gh-pages.css)) //И в gh-pages
        .pipe(reload({stream: true}));
});

gulp.task('image:gh-pages', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.gh-pages.img)) //И бросим в gh-pages
        .pipe(reload({stream: true}));
});

gulp.task('fonts:gh-pages', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.gh-pages.fonts))
});

gulp.task('gh-pages', [
    'html:gh-pages',
    'js:gh-pages',
    'style:gh-pages',
    'fonts:gh-pages',
    'image:gh-pages'
]);

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:gh-pages');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:gh-pages');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:gh-pages');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:gh-pages');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:gh-pages');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['gh-pages', 'webserver', 'watch']);