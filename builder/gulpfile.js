var gulp       = require('gulp-help')(require('gulp'));
var awspublish = require('gulp-awspublish');
var fs         = require('fs');
var shell      = require('gulp-shell');
var uglify     = require('gulp-uglify');
var minifyCSS  = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');

var paths = {
  tinkererSourceDir : '../tinkerer',
  tinkererOutputDir : '../tinkerer/blog/html',
  outputDir: '../dist'
};

gulp.task('build:tinkerer', shell.task([
  'tinker -b'
], {cwd: paths.tinkererSourceDir}));

gulp.task('copy:static', ['build:tinkerer'], function() {
  return gulp.src(['!' + paths.tinkererOutputDir + '/**/*.js',
                   '!' + paths.tinkererOutputDir + '/**/*.css',
                   '!' + paths.tinkererOutputDir + '/**/*.html',
                   paths.tinkererOutputDir + '/**/*.*'])
    .pipe(gulp.dest(paths.outputDir));
});

gulp.task('minify:js', ['build:tinkerer'], function() {
  return gulp.src(paths.tinkererOutputDir + '/**/*.js')
    .pipe(uglify())
    .pipe(gulp.dest(paths.outputDir));
});

gulp.task('minify:css', ['build:tinkerer'], function() {
  return gulp.src(paths.tinkererOutputDir + '/**/*.css')
    .pipe(minifyCSS())
    .pipe(gulp.dest(paths.outputDir));
});

gulp.task('minify:html', ['build:tinkerer'], function() {
  var opts = {
    conditionals: true
  };

  return gulp.src(paths.tinkererOutputDir + '/**/*.html')
    .pipe(minifyHTML(opts))
    .pipe(gulp.dest(paths.outputDir));
});

gulp.task('deploy', function(){
  var aws       = JSON.parse(fs.readFileSync('../aws.json'));
  var publisher = awspublish.create(aws);
  var headers   = {
     //'Cache-Control': 'max-age=315360000, no-transform, public'
  };
  gulp.src(paths.outputDir + '/**/*')
    .pipe(publisher.publish())
    .pipe(publisher.sync())
    .pipe(awspublish.reporter());
});

gulp.task('default', [
  'build:tinkerer',
  'minify:html',
  'minify:js',
  'minify:css',
  'copy:static'
]);
