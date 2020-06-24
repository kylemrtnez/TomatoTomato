const { src, dest, series } = require('gulp');
const del = require('del');
const zip = require('gulp-zip');
const rename = require('gulp-rename');
const manifest = require('./manifest.master.json')
const jeditor = require('gulp-json-editor')
const fs = require('fs');

function clean() {
  return del(['build/**', '!build', 'dist/**', '!dist', 'manifest*json', '!manifest.master.json'])
}

function genFirefoxManifest() {
  return src('./manifest.master.json')
    .pipe(jeditor((json) => {
      return { ...json.common, ...json.firefox}
    }))
    .pipe(rename((path) => {
      path.basename = 'manifest.firefox'
    }))
    .pipe(dest('.'))
}

function genChromeManifest() {
  return src('./manifest.master.json')
    .pipe(jeditor((json) => {
      return { ...json.common, ...json.chrome}
    }))
    .pipe(rename((path) => {
      path.basename = 'manifest.chrome'
    }))
    .pipe(dest('.'))
}

function useChromeManifest() {
  return src('./manifest.chrome.json')
    .pipe(rename((path) => {
      path.basename = 'manifest'
    }))
    .pipe(dest('.'))
}

function useFirefoxManifest() {
  return src('./manifest.firefox.json')
    .pipe(rename((path) => {
      path.basename = 'manifest'
    }))
    .pipe(dest('.'))
}

function buildChrome() 
{
  return src('**/background/*')
    .pipe(src('**/popup/*'))
    .pipe(src('**/options/*'))
    .pipe(src('**/redirect/*'))
    .pipe(src('**/icons/*'))
    .pipe(src('**/sounds/*'))
    .pipe(src('manifest.json'))
    .pipe(dest('build/chrome'))
}

function buildFirefox() 
{
  return src('**/background/*')
    .pipe(src('**/popup/*'))
    .pipe(src('**/options/*'))
    .pipe(src('**/redirect/*'))
    .pipe(src('**/icons/*'))
    .pipe(src('**/sounds/*'))
    .pipe(src('manifest.json'))
    .pipe(dest('build/firefox'))
}

async function build() {
  await series(genChromeManifest, useChromeManifest, buildChrome, genFirefoxManifest, useFirefoxManifest, buildFirefox)()
}

function chromedist() {
  return src('build/chrome/**')
    .pipe(zip('tomatotomato-chrome-' + manifest.common.version + '.zip'))
    .pipe(dest('dist'));
}

function firefoxdist() {
  return src('build/firefox/**')
    .pipe(zip('tomatotomato-firefox-' + manifest.common.version + '.zip'))
    .pipe(dest('dist'));
}

module.exports = {
  'clean': clean,
  'build': series(clean, build), 
  'dist': series(build,chromedist, firefoxdist),
  'default': series(clean, build, chromedist, firefoxdist)
};