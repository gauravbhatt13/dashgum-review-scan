var gulp = require('gulp');
var sass = require('gulp-sass');
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var browserSync = require('browser-sync').create();
var nodemon = require('gulp-nodemon');

// Set the banner content
var banner = ['/*!\n',
    ' * Start Bootstrap - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2013-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' * Licensed under <%= pkg.license %> (https://github.com/BlackrockDigital/<%= pkg.name %>/blob/master/LICENSE)\n',
    ' */\n',
    ''
].join('');

// Copy third party libraries from /node_modules into./public/vendor
gulp.task('vendor', function () {
    //Angular Sanitize
    gulp.src([
        './node_modules/angular-sanitize/angular-sanitize.js'
    ])
        .pipe(gulp.dest('./public/vendor/angular-sanitize'))
    //Angular Resource
    gulp.src([
        './node_modules/angular-resource/angular-resource.js'
    ])
        .pipe(gulp.dest('./public/vendor/angular-resource'))

    //Angular chart
    gulp.src([
        './node_modules/angular-chart.js/dist/angular-chart.js'
    ])
        .pipe(gulp.dest('./public/vendor/angular-chart.js'))

    gulp.src([
        './node_modules/chart.js/dist/Chart.js'
    ])
        .pipe(gulp.dest('./public/vendor/chart.js'))
    //UI Router
    gulp.src([
        './node_modules/@uirouter/angularjs/release/angular-ui-router.js'
    ])
        .pipe(gulp.dest('./public/vendor/@uirouter'))
    //Angular smart-table
    gulp.src([
        './node_modules/angular-smart-table/dist/smart-table.js'
    ])
        .pipe(gulp.dest('./public/vendor/angular-smart-table'))

    //d3
    gulp.src([
        './node_modules/d3/build/d3.js'
    ])
        .pipe(gulp.dest('./public/vendor/d3'))
    //d3-cloud
    gulp.src([
        './node_modules/d3-cloud/build/d3.layout.cloud.js'
    ])
        .pipe(gulp.dest('./public/vendor/d3-cloud'))
    //Angular d3 word
    gulp.src([
        './node_modules/angular-d3-word-cloud/dist/angular-word-cloud.js'
    ])
        .pipe(gulp.dest('./public/vendor/angular-d3-word-cloud'))
    //Angular
    gulp.src([
        './node_modules/angular/angular.min.js'
    ])
        .pipe(gulp.dest('./public/vendor/angular'))
});


// Minify JavaScript
gulp.task('js:minify', function () {
    return gulp.src([
        './public/js/appjs/*.js'
    ])
        .pipe(uglify())
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./js/appjs'))
        .pipe(browserSync.stream());
});

// JS
//gulp.task('js', ['js:minify']);

// Default task
gulp.task('default', ['vendor']);

// Configure the browserSync task
gulp.task('browserSync', ['nodemon'], function () {
    browserSync.init(null, {
        proxy: "http://localhost:3000", // port of node server
        port: 3003
    });
});

// Dev task
gulp.task('dev', ['browserSync'], function () {
    gulp.watch('./public/stylesheets/*.css');
    gulp.watch('./public/assets/css/*.css', browserSync.reload);
    gulp.watch('./public/js/appjs/*.js', browserSync.reload);
    gulp.watch('./public/*.html', browserSync.reload);
});

gulp.task('nodemon', function (cb) {
    var callbackCalled = false;
    return nodemon({
        script: './bin/www',
        watch: [
            "routes/"
        ],
        nodeArgs: ['--inspect']
    }).on('start', function () {
        if (!callbackCalled) {
            callbackCalled = true;
            cb();
        }
    });
});