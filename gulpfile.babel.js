/**
 * Gulp 4 implementation using es6
 **/

import chalk            from 'chalk';
import childProcess     from 'child_process';
import del              from 'del';
import gulp             from 'gulp';
import gulpAutoprefixer from 'gulp-autoprefixer';
import gulpEslint       from 'gulp-eslint';
import gulpLog          from 'gulplog';
import gulpRename       from 'gulp-rename';
import gulpSass         from 'gulp-sass';
import gulpSourcemaps   from 'gulp-sourcemaps';
import map              from 'lodash/map';

const npmDirectory = 'node_modules',
      paths        = {
          'sass': {
              'src'  : 'public/sass/app.scss',
              'watch': 'public/sass/**/*.scss',
              'dest' : 'public/css'
          },
          'js': {
              'src': [
                  'public/js/**/*.js',
                  '!public/js/main.js*',
                  '!public/js/vendor.js*'
              ],
              'watch': [
                  'public/js/**/*.js',
                  '!public/js/main.js*',
                  '!public/js/vendor.js*'
              ],
              'dest': 'public/js'
          },
          'vendors': {
              'sass': [
                  {
                      'src': [
                          `${npmDirectory}/materialize-css/sass/**/*.scss`,
                          `!${npmDirectory}/materialize-css/sass/components/_variables.scss`
                      ],
                      'dest': 'public/sass/vendors/materialize'
                  },
                  {
                      'src' : `${npmDirectory}/font-awesome/scss/**/*.scss`,
                      'dest': 'public/sass/vendors/font-awesome'
                  },
                  {
                      'src' : `${npmDirectory}/roboto-fontface/css/roboto/sass/**/*.scss`,
                      'dest': 'public/sass/vendors/roboto-fontface'
                  }
              ],
              'fonts': [
                  {
                      'src' : `${npmDirectory}/font-awesome/fonts/**`,
                      'dest': 'public/fonts'
                  },
                  {
                      'src' : `${npmDirectory}/roboto-fontface/fonts/Roboto/*`,
                      'dest': 'public/fonts/roboto'
                  }
              ]
          }
      };

/* --------------------------------------------------------------------------
 * Vendors bower requirements
 * --------------------------------------------------------------------------
 */

/**
 * Download vendors dependencies in bower_components directory
 *
 * @param {Function} done Callback to sync
 * @returns {*} Gulp callback
 */
export function vendorsDownload (done) {
    childProcess.exec(
        'npm install',
        (err) => {
            done(err);
        }
    ).stdout.on('data', (data) => console.log(data));
}

/**
 * Move sass vendors files into www/sass/vendors directory
 *
 * @param {Function} done Callback to sync
 * @returns {*} Gulp callback
 */
export function vendorsMoveSass (done) {
    map(paths.vendors.sass, (vendor) => gulp.src(vendor.src).pipe(gulp.dest(vendor.dest)));

    return done();
}

/**
 * Move fonts vendors files into resources/assets/fonts directory
 *
 * @param {Function} done Callback to sync
 * @returns {*} Gulp callback
 */
export function vendorsMoveFonts (done) {
    map(paths.vendors.fonts, (vendor) => gulp.src(vendor.src).pipe(gulp.dest(vendor.dest)));

    return done();
}

/**
 * Clean vendors dependencies in js, fonts and sass source files (not in node_modules)
 *
 * @returns {*} Gulp callback
 */
export function vendorsClean () {
    return del(
        [
            'public/js/vendor.js',
            'public/js/vendor.js.map',
            'public/fonts',
            'public/sass/vendors/**',
            '!public/sass/vendors',
            '!public/sass/vendors/materialize',
            '!public/sass/vendors/materialize/components',
            '!public/sass/vendors/materialize/components/_variables.scss'
        ]
    );
}

/**
 * Wrapper for vendorsDownload then vendorsClean then vendorsMoveSass, bowerMoveCss and vendorsMoveFonts
 *
 * @returns {*} Gulp callback
 */
gulp.task(
    'vendors',
    gulp.series(
        vendorsDownload,
        gulp.series(vendorsClean, gulp.parallel(vendorsMoveSass, vendorsMoveFonts))
    )
);

/* --------------------------------------------------------------------------
 * Sass / js build
 * --------------------------------------------------------------------------
 */

/**
 * Compile sass files and generate map in .css result file
 *
 * @returns {*} Gulp callback
 */
export function sassDev () {
    return gulp.src(paths.sass.src)
               .pipe(gulpSourcemaps.init())
               .pipe(gulpSass({'outputStyle': 'compressed'}).on('error', gulpSass.logError))
               .pipe(gulpAutoprefixer())
               .pipe(gulpSourcemaps.write())
               .pipe(gulpRename('style.css'))
               .pipe(gulp.dest(paths.sass.dest));
}

/**
 * Compile sass files in a .css file
 *
 * @returns {*} Gulp callback
 */
export function sassProd () {
    return gulp.src(paths.sass.src)
               .pipe(gulpSass({'outputStyle': 'compressed'}).on('error', gulpSass.logError))
               .pipe(gulpAutoprefixer())
               .pipe(gulpRename('style.css'))
               .pipe(gulp.dest(paths.sass.dest));
}

/**
 * Build the js source files into www/js/main.js and www/js/vendor.js
 *
 * @param {Function} done Callback to sync
 * @returns {*} Gulp callback
 */
export function buildJs (done) {
    childProcess.exec(
        'npm run build',
        (err) => {
            done(err);
        }
    ).stdout.on('data', (data) => console.log(data));
}

/**
 * Watch sass and js files and build with sassDev or buildJs on files change
 *
 * @returns {*} void
 */
export function watch () {
    const sassWatcher = gulp.watch(paths.sass.watch, sassDev),
          jsWatcher   = gulp.watch(paths.js.watch, buildJs);

    sassWatcher.on(
        'change', (path) => {
            gulpLog.info(`File ${chalk.magenta(path)} was changed`);
        }
    );

    jsWatcher.on(
        'change', (path) => {
            gulpLog.info(`File ${chalk.magenta(path)} was changed`);
        }
    );
}

/* --------------------------------------------------------------------------
 * Init
 * --------------------------------------------------------------------------
 */

/**
 * Wrapper for initialize all the project
 *
 * @returns {*} Gulp callback
 */
gulp.task(
    'init',
    gulp.series(
        'vendors',
        buildJs,
        sassDev
    )
);

/* --------------------------------------------------------------------------
 * Linter
 * --------------------------------------------------------------------------
 */

/**
 * Lint js files with eslint linter
 *
 * @returns {*} Gulp callback
 */
export function eslint () {
    return gulp.src(paths.js.src)
               .pipe(gulpEslint({"fix": true}))
               .pipe(
                   gulpEslint.result(
                       (result) => {
                           console.log(`ESLint result: ${result.filePath}`);
                           console.log(`# Messages: ${result.messages.length}`);
                           console.log(`# Warnings: ${result.warningCount}`);
                           console.log(`# Errors: ${result.errorCount}`);
                       }
                   )
               )
               .pipe(gulpEslint.format())
               .pipe(gulpEslint.failAfterError());
}

/* --------------------------------------------------------------------------
 * jsDoc
 * --------------------------------------------------------------------------
 */

/**
 * Generate the jsdoc in storage/app/public/jsDoc
 *
 * @todo check where to put the documentation based on laravel architecture (storage/app/public/jsDoc)
 *
 * @param {Function} done Callback to sync
 * @returns {*} Gulp callback
 */
export function jsdoc (done) {
    childProcess.exec(
        '"./node_modules/.bin/jsdoc"' +
        ' -c jsdocConfig.json' +
        ' -r -t ./node_modules/ink-docstrap/template --verbose',
        (err) => {
            done(err);
        }
    ).stdout.on('data', (data) => console.log(data));
}
