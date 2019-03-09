var postcss = require("gulp-postcss");
const { series, parallel, task, watch, src, dest } = require("gulp");
var del = require("del");
var sass = require("gulp-sass");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var pipeline = require("readable-stream").pipeline;
var browserify = require('browserify');
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");
var sourcemaps = require("gulp-sourcemaps");
var babelify = require("babelify");
var gulpif = require("gulp-if");

const prod = process.env.NODE_ENV === "production";

const files = {
  sassEntry:"src/sass/style.scss",
  sass:"src/**/*.{scss,css}",  
  cssBundlePath:"dist",  
  jsEntry:"src/js/script.js",
  js:"src/**/*.js",
  jsBundle:"bundle.js",
  jsBundlePath:"dist",
  html:"src/**/*.html",
  dist:"dist"
}

sass.compiler = require("node-sass");

const compileSass = function () {
  return src(files.sassEntry)
    .pipe(sourcemaps.init())
    .pipe(sass().on("error", sass.logError))    
    .pipe(gulpif(prod,postcss([require("autoprefixer"), require("cssnano")])))
    .pipe(sourcemaps.write("./"))   
    .pipe(dest(files.cssBundlePath))
}

const watchSass = function() {
   watch(files.sass, compileSass);
}

const bundleJS = function() {
  return browserify({entries: files.jsEntry, debug:true})
  .transform("babelify", {presets: ["@babel/preset-env"]})
  .bundle()  
  .pipe(source(files.jsBundle))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps:true}))  
  .pipe(gulpif(prod,uglify()))  
  .pipe(sourcemaps.write("./"))
  .pipe(dest(files.jsBundlePath));
}

const watchJS = function() {
  return watch(files.js, bundleJS)
}

const html = function() {
  return src(files.html)
  .pipe(dest(files.dist));
}

const watchHtml = function(){
  return watch(files.html,html)
}

const cleanDist = function() {
  return del(files.dist);
}

const build = series(cleanDist,parallel(bundleJS,compileSass,html));

const watchAll = parallel(watchJS,watchSass,watchHtml);


exports.watch = series(build,watchAll);
exports.build = build;
