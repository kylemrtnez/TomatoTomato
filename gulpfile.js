const { src, dest, series, parallel } = require('gulp');
const del = require('del');
const zip = require('gulp-zip');
const manifest = require('./manifest.json')

function clean() {
  return del(['build/**', '!build', 'dist/**', '!dist'])
}

function build() {
  return src('**/background/*')
    .pipe(src('**/popup/*'))
    .pipe(src('**/options/*'))
    .pipe(src('**/redirect/*'))
    .pipe(src('**/icons/*'))
    .pipe(src('**/sounds/*'))
    .pipe(src('manifest.json'))
    .pipe(dest('build/chrome'))
    .pipe(dest('build/firefox'));
}

function chromedist() {
  return src('build/chrome/**')
    .pipe(zip('tomatotomato-chrome-' + manifest.version + '.zip'))
    .pipe(dest('dist'));
}

function firefoxdist() {
  return src('build/firefox/**')
    .pipe(zip('tomatotomato-firefox-' + manifest.version + '.zip'))
    .pipe(dest('dist'));
}

module.exports = {
  'clean': clean,
  'build': series(clean, build), 
  'chrome-dist': chromedist,
  'firefox-dist': firefoxdist,
  'dist': series(build, parallel(chromedist, firefoxdist)),
};