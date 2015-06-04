var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');

gulp.task('build', function () {
  var files = ['src/ng.js',
               'src/services/*.js',
               'src/ng-scope.js',
               'src/ng-parse.js',
               'src/ng-compile.js',
               'src/ng-apply.js',
               'src/directives/*.js',
               'src/ng-dev.js',
               'src/ng-init.js'];

  gulp.src(files)
      .pipe(concat('ng.js'))
      .pipe(gulp.dest('dist'));

  gulp.src(files)
      .pipe(concat('ng-min.js'))
      .pipe(uglify())
      .pipe(gulp.dest('dist'));
});

gulp.task('watch', function () {
  gulp.watch('src/**/*.js', ['build']);
});

