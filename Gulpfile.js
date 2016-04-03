var gulp = require('gulp');
var sass = require('gulp-sass');
var inject = require('gulp-inject');
var bowerFiles = require('main-bower-files');

var sass_input = './src/sass/**/*.scss'; //where we get out .scss files
var sass_output = './src/css/'; //where we dump our .css files

//compile into .css
gulp.task('sass', function() {
    gulp.src(sass_input)
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(sass_output));
});

//compile into compressed .css
gulp.task('sass.min', function () {
   gulp.src(sass_input)
        .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
        .pipe(gulp.dest(sass_output)) 
});

//Watch task
gulp.task('sass:watch',function() {
    gulp.watch('./src/sass/**/*.scss',['sass']);
});

//inject css/js to index.html
gulp.task('index', function () {
  var target = gulp.src('./src/index.html');
  // It's not necessary to read the files (will speed up things), we're only after their paths:
  var sources = gulp.src(['./src/**/*.js', './src/**/*.css'], {read: false});

  return target.pipe(inject(sources))
    .pipe(inject(gulp.src(bowerFiles(), {read: false}), {name: 'bower'}))
    .pipe(gulp.dest('./src'));
});