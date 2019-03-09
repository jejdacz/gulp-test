var postcss = require("gulp-postcss");
const { series, parallel, task, watch, src, dest } = require("gulp");
var del = require("del");
var sass = require("gulp-sass");
var concat = require("gulp-concat");
var babel = require("gulp-babel");
var uglify = require("gulp-uglify");
var pipeline = require("readable-stream").pipeline;
var browserify = require('browserify');
var tap = require("gulp-tap");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var sourcemaps = require("gulp-sourcemaps");

const files = {
  sassEntry:"src/sass/style.scss",
  sass:"src/**/*.{scss,css}",
  cssBundle:"bundle.css",
  cssBundlePath:"dist",  
  jsEntry:"dist/js/script.js",
  js:"src/**/*.js",
  jsBundle:"bundle.js",
  jsBundlePath:"dist",
  html:"src/**/*.html",
  dist:"dist"
}

sass.compiler = require("node-sass");

const compileSassDev = function () {
  return src(files.sassEntry)
    .pipe(sass().on("error", sass.logError))
    .pipe(concat(files.cssBundle))
    .pipe(dest(files.cssBundlePath))
}

const compileSassProd = function () {
  return src(files.sassEntry)
    .pipe(sass().on("error", sass.logError))    
    .pipe(postcss([require("autoprefixer"), require("cssnano")]))
    .pipe(concat(files.cssBundle))
    .pipe(dest(files.cssBundlePath))
}

const watchSass = function() {
   watch(files.sass, compileSassDev);
}

const compileJS = function() {
  return src(files.js)
    .pipe(babel({presets:["@babel/env"]}))
    .pipe(dest(files.jsBundlePath))
}

const bundleJSprod = function() {
  return browserify({entries: files.jsEntry, debug:true}).bundle()  
  .pipe(source(files.jsBundle))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(sourcemaps.init({loadMaps:true}))
  .pipe(sourcemaps.write("./"))
  .pipe(dest(files.jsBundlePath));
}

const bundleJSdev = function() {
  return browserify({entries: files.jsEntry, debug:true}).bundle()  
  .pipe(source(files.jsBundle))  
  .pipe(dest(files.jsBundlePath));
}

const cleanJS = function() {
  return del(["dist/**/!(bundle).js","dist/js"]);
}

const watchJS = function() {
  return watch(files.js, series(compileJS,bundleJSdev,cleanJS))
}

const html = function() {
  return src(files.html)
  .pipe(dest(files.dist));
}

const watchHtml = function(){
  return watch(files.html,html)
}

const clean = function() {
  return del(files.dist);
}

const buildDev = series(clean,parallel(series(compileJS,bundleJSdev,cleanJS),compileSassDev,html));

const watchAll = parallel(watchJS,watchSass,watchHtml);


exports.watch = series(buildDev,watchAll);
exports.build = series(clean,parallel(series(compileJS,bundleJSprod,cleanJS),compileSassProd,html));
