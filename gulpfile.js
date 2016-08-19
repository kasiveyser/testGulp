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
	docs: { //Тут мы укажем куда складывать готовые после сборки файлы
		html: 'docs/',
		js: 'docs/js/',
		css: 'docs/css/',
		img: 'docs/img/',
		fonts: 'docs/fonts/'
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
	clean: './docs'
};

var config = {
	server: {
		baseDir: "./docs"
	},
	tunnel: true,
	host: 'localhost',
	port: 9000,
	logPrefix: "Frontend_Devil"
};

gulp.task('html:docs', function () {
	gulp.src(path.src.html) //Выберем файлы по нужному пути
		.pipe(rigger()) //Прогоним через rigger
		.pipe(gulp.dest(path.docs.html)) //Выплюнем их в папку docs
		.pipe(reload({stream: true})); //И перезагрузим наш сервер для обновлений
});

gulp.task('js:docs', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.docs.js)) //Выплюнем готовый файл в docs
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

gulp.task('style:docs', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer()) //Добавим вендорные префиксы
        .pipe(cssmin()) //Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.docs.css)) //И в docs
        .pipe(reload({stream: true}));
});

gulp.task('image:docs', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.docs.img)) //И бросим в docs
        .pipe(reload({stream: true}));
});

gulp.task('fonts:docs', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.docs.fonts))
});

gulp.task('docs', [
    'html:docs',
    'js:docs',
    'style:docs',
    'fonts:docs',
    'image:docs'
]);

gulp.task('watch', function(){
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:docs');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:docs');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:docs');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:docs');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:docs');
    });
});

gulp.task('webserver', function () {
    browserSync(config);
});

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

gulp.task('default', ['docs', 'webserver', 'watch']);