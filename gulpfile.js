var fs = require('fs');

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    minifycss = require('gulp-minify-css'),
    replace = require('gulp-replace'),
    watch = require('gulp-watch'),
    inline = require('gulp-inline'),
    htmlreplace = require('gulp-html-replace'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    es = require('event-stream'),
    compass = require('gulp-compass');
var rjs = require('gulp-requirejs');

var src = './src';
var dist = './public';

var cssList = ["./src/css/bootstrap.min.css","./src/css/main.css"];
var mcssList = ["./src/css/bootstrap.min.css","./src/css/manage.css"];
var jqlib = ['./src/js/lib/jquery/jquery-2.0.3.min.js','./src/js/lib/angular/angular_1.2.6.js','./src/js/lib/underscore/underscore.min.js','./src/js/lib/bootstrap.min.js'];
var teacher = [
  './src/js/constants/constants.js',
  './src/js/service/UtilsService.js',
  './src/js/service/mgradeService.js',
  './src/js/service/studentService.js',
  './src/js/service/teacherService.js',
  './src/js/service/quotaService.js',
  './src/js/controllers/gradelistController.js',
  './src/js/controllers/indexnavController.js',
  './src/js/controllers/mheadernavController.js',
  './src/js/controllers/studentController.js',
  './src/js/controllers/teacherController.js',
  './src/js/controllers/quotaController.js',
  './src/js/teacher.js'
];
var student = [
  './src/js/constants/constants.js',
  './src/js/service/UtilsService.js',
  './src/js/service/mgradeService.js',
  './src/js/service/studentService.js',
  './src/js/service/quotaService.js',
  './src/js/controllers/gradelistController.js',
  './src/js/controllers/indexnavController.js',
  './src/js/controllers/studentController.js',
  './src/js/controllers/quotaController.js',
  './src/js/student.js'
];
var manage = [
  './src/js/constants/constants.js',
  './src/js/service/UtilsService.js',
  './src/js/service/mgradeService.js',
  './src/js/service/studentService.js',
  './src/js/service/teacherService.js',
  './src/js/service/quotaService.js',
  './src/js/controllers/gradelistController.js',
  './src/js/controllers/manageController.js',
  './src/js/controllers/managenavController.js',
  './src/js/controllers/mheadernavController.js',
  './src/js/controllers/studentController.js',
  './src/js/controllers/teacherController.js',
  './src/js/controllers/quotaController.js',
  './src/js/controllers/creategradeController.js',
  './src/js/manage.js'
];


gulp.task('concat',function(){
  gulp.src(jqlib)
    .pipe(concat('jslib.js'))
    .pipe(gulp.dest('./public/js/lib'));

  gulp.src(teacher)
    .pipe(concat('teacher.js'))
    .pipe(gulp.dest('./public/js/'));  

  gulp.src(student)
    .pipe(concat('student.js'))
    .pipe(gulp.dest('./public/js/')); 

  gulp.src(manage)
    .pipe(concat('manage.js'))
    .pipe(gulp.dest('./public/js/')); 

  gulp.src(cssList)
    .pipe(concat('main.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('./public/css/'));

  gulp.src(mcssList)
    .pipe(concat('manage.css'))
    .pipe(minifycss())
    .pipe(gulp.dest('./public/css/'));

});

gulp.task('build',function(){
  gulp.src('src/*.html')
    .pipe(replace('%TimeStamp%',new Date().getTime()))
    .pipe(htmlreplace({    
      'maincss' : 'css/main.css?t='+new Date().getTime(),
      'managecss' : 'css/manage.css?t='+new Date().getTime(),
      'lib' : 'js/lib/jslib.js',
      'teacher' : 'js/teacher.js?t='+new Date().getTime(),
      'student' : 'js/student.js?t='+new Date().getTime(),
      'manage' : 'js/manage.js?t='+new Date().getTime()
    }))
    .pipe(gulp.dest('./public/'));  
});

gulp.task('copy',function(){
  // gulp.src('./src/js/player/**')
  //   .pipe(gulp.dest('./web/js/player')); 
  // gulp.src('./src/js/lib/jquery/jquery-1.8.3.js')
  //   .pipe(gulp.dest('./web/js/lib/jquery')); 
  // gulp.src('./src/js/lib/require/require.2.1.8.js')
  //   .pipe(gulp.dest('./web/js/lib/require'));
  // gulp.src('./src/js/lib/flex/*')
  //   .pipe(gulp.dest('./web/js/lib/flex'));

  gulp.src('./src/css/imgs/**')
    .pipe(gulp.dest('./public/css/imgs'));
  // gulp.src('./src/css/img/**')
  //   .pipe(gulp.dest('./web/css/img'));  
  // gulp.src('./src/css/player/**')
  //   .pipe(gulp.dest('./web/css/player')); 
  // gulp.src('./src/tmpl/**')
  //   .pipe(gulp.dest('./web/tmpl'));
});

gulp.task('watch',function(){
  gulp.watch('./src/js/**',['concat','build']);
  gulp.watch('./src/css/**',['concat','copy','build']);  
  gulp.watch('./src/*.html',['build']);
  gulp.watch('./src/tmpl/*.html',['copy']);
});

gulp.task('default', ['concat','build','copy','watch'], function() {
  console.log('gulp start');
});
/*
gulp.task('default', ['build'], function() {
  console.log('构建完成');
});
*/
/*
gulp.task('requirejs', function() {
  rjs({
    name: 'main',
    baseUrl: './js/main.js',
    out: 'main-min.js',
    mainConfigFile: './js/main.js',
    shim: {}
  })
  .pipe(gulp.dest('./web1/js'));
});
*/