'use strict';

const fs = require('fs');
const gulp = require('gulp');
const pug = require('pug');
const sass = require('node-sass');
const rimraf = require('rimraf');
const outputDirectory = 'dist';
const preprocessData = require('./views/preprocess-data');

const data = preprocessData(require('./dev-cycle-data'));

const calculateColor = (daysRatio, progressRatio, choices) => {
  switch (true) {
    case (progressRatio > daysRatio):
      return choices[2];
    case (progressRatio < daysRatio / 2):
      return choices[0];
    default:
      return choices[1];
  }
};

gulp.task('print', () => {
  console.log(JSON.stringify(data, null, 2));
});

gulp.task('build', ['createOutputDirectory', 'views', 'style']);

gulp.task('views', () => {
  const html = pug.renderFile('views/index.pug', Object.assign(data, { calculateColor }));
  writeOutputFile('index.html', html);
});

gulp.task('style', ['fonts'], () => {
  const result = sass.renderSync({ file: 'style/style.scss' });
  writeOutputFile('style.css', result.css);
});

gulp.task('fonts', () => {
  gulp.src('./style/fonts/*.woff')
    .pipe(gulp.dest(outputDirectory));
});

gulp.task('createOutputDirectory', () => {
  createOutputDirectory();
});

gulp.task('clean', () => {
  cleanOutputDirectory();
});


function createOutputDirectory() {
  if (!fs.existsSync(outputDirectory)) {
    fs.mkdirSync(outputDirectory);
  }
}

function writeOutputFile(relativePath, data) {
  fs.writeFileSync(outputDirectory + '/' + relativePath, data, 'utf8');
}

function cleanOutputDirectory() {
  rimraf.sync(outputDirectory);
}
