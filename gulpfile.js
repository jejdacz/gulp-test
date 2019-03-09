var postcss = require("gulp-postcss");
const { series, task, watch, src, dest } = require("gulp");
var del = require("del");
var sass = require("gulp-sass");
var concat = require("gulp-concat");
var babel = require("gulp-babel");
var uglify = require("gulp-uglify");
var pipeline = require("readable-stream").pipeline;

const files = {
  styles:["src/sass/style.scss"]
}

sass.compiler = require("node-sass");

const sassDev = function () {
  return src(files.styles)
    .pipe(sass().on("error", sass.logError))
    .pipe(concat("style.css"))
    .pipe(dest("dist/dev"))
}

const sassProd = function () {
  return src(files.styles)
    .pipe(sass().on("error", sass.logError))    
    .pipe(postcss([require("autoprefixer"), require("cssnano")]))
    .pipe(concat("style.css"))
    .pipe(dest("dist/prod"))
}

task("sass:watch", function() {
   watch(["src/**/*.{scss,css}"], sassDev);
});

task("clean", function() {
  return del("dist");
});

exports["sass:prod"] = sassProd;
exports["sass:dev"] = sassDev;
