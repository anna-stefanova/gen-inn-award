const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browser_sync = require('browser-sync').create();
const uglify =require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const del = require('del');
const clean = require('gulp-clean');
const cssmin = require('gulp-cssmin');
const newer =require('gulp-newer');
const svgSprite = require('gulp-svg-sprite');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');
const include = require('gulp-include');

function pages() {
    return src('app/pages/*.html')
        .pipe(include({
            includePaths: 'app/components'
        }))
        .pipe(dest('app'))
        .pipe(browser_sync.stream())
}

function documents() {
    return src('app/images/documents/*')
        .pipe(dest('app/documents'))
        .pipe(browser_sync.stream())
}

function cleanDist() {
    return src('dist')
        .pipe(clean());
}

function images() {
    return src(['app/images/src/*.*', '!app/images/src/*.svg'])
        .pipe(newer('app/images'))
        .pipe(avif({ quality: 50}))

        .pipe(src('app/images/src/*.*'))
        .pipe(newer('app/images'))
        .pipe(webp())

        .pipe(src('app/images/src/*.*'))
        .pipe(newer('app/images'))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.mozjpeg({quality: 75, progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(dest('app/images'));
}

function sprite() {
    return src('app/images/src/*.svg')
        .pipe(svgSprite({

            mode: {
                stack: {
                    sprite: '../sprite.svg',
                    example: true
                }
            }
        }))
        .pipe(dest('app/images'));
}

function scripts() {
    return src([
        'node_modules/simple-keyboard/build/index.js',
        'node_modules/simple-keyboard-layouts/build/index.js',

    ])
        .pipe(concat('libs.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browser_sync.stream())
}
function qrReadLibrary() {
    return src([
        'node_modules/@zxing/library/umd/index.js'
    ])
        .pipe(concat('zxing.js'))
        .pipe(dest('app/js'))
        .pipe(browser_sync.stream())
}

function js() {
    return src('app/js/main.js')
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js'))
        .pipe(browser_sync.stream())
}

function qrScripts() {
    return src('app/js/qr-scripts.js')

        .pipe(dest('app/js'))
        .pipe(browser_sync.stream())
}

function sass() {
    return src('app/scss/*.scss')
        .pipe(scss.sync().on('error', scss.logError))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 10 version'],
            grid: true
        }))
        .pipe(dest('app/css/'))
        .pipe(concat('style.min.css'))
        .pipe(scss({outputStyle: 'compressed'}))
        .pipe(dest('app/css'))
        .pipe(browser_sync.stream())
}

function style() {
    return src([
        'node_modules/css-reset-and-normalize/css/reset-and-normalize.css',
        'node_modules/simple-keyboard/build/css/index.css'
    ])
        .pipe(concat('lib.min.css'))
        .pipe(cssmin())
        .pipe(dest('app/css'))
        .pipe(browser_sync.stream())
}

function building() {
    return src([
        'app/css/style.css',
        'app/css/style.min.css',
        'app/css/libs.min.css',
        'app/fonts/*.*',
        'app/images/*.*',
        '!app/images/*.svg',
        'app/images/sprite.svg',
        'app/js/libs.min.js',
        'app/js/main.min.js',
        'app/js/zxing.js',
        'app/js/qr-scripts.js',
        'app/js/main.js',
        'app/documents/*.*',
        'app/*.html'
    ], {base: 'app'})
        .pipe(dest('dist'))
}

function fonts() {
    return src("app/fonts/src/*.*")
        .pipe(fonter({
            formats: ['woff', 'ttf', 'eot']
        }))
        .pipe(src('app/fonts/src/*.ttf'))
        .pipe(ttf2woff2())
        .pipe(dest('app/fonts'))
        .pipe(browser_sync.stream())
}

function watching() {
    browser_sync.init({
        server: {
            baseDir: "app/"
        }
    });
    watch(['app/scss/**/*.scss'], sass);
    watch(['app/js/main.js'], js);
    watch(['app/js/qr-scripts.js'], js);
    watch(['app/images'], images);
    watch(['app/fonts/!**/!*.{eot,woff,woff2,ttf,svg}'], fonts);
    watch(['app/components/*', 'app/pages/*'], pages);
    watch(['app/documents/*'], documents) ;
    watch(['app/*.html']).on('change', browser_sync.reload) ;
}

exports.style = style;
exports.sass = sass;
exports.scripts = scripts;
exports.qrReadLibrary = qrReadLibrary;
exports.js = js;
exports.qrSctips = qrScripts;
exports.images = images;
exports.sprite = sprite;
exports.fonts = fonts;
exports.pages = pages;
exports.documents = documents;
exports.watching = watching;

exports.build = series(cleanDist, building);
exports.default = parallel(style, scripts, qrReadLibrary, qrScripts, js, sass, images, sprite, fonts, pages, documents, watching);

