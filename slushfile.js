var gulp = require('gulp');
var install = require('gulp-install');
var conflict = require('gulp-conflict');
var template = require('gulp-template');
var inquirer = require('inquirer');
var path = require('path');
var _s = require('underscore.string');
var rename = require('gulp-rename');
var es = require('event-stream');
var jeditor = require('gulp-json-editor');

gulp.task('default', function(done) {
  inquirer.prompt([
    {type: 'input', name: 'name', message: 'Give your app a name', default: gulp.args.join(' ')}, // Get app name from arguments by default
    {type: 'confirm', name: 'moveon', message: 'Continue?'},
  ],
  function(answers) {
    if (!answers.moveon) {
      return done();
    }

    gulp.src(__dirname + '/templates/**')  // Note use of __dirname to be relative to generator
      .pipe(template(answers))                 // Lodash template support
      .pipe(conflict('./'))                    // Confirms overwrites on file conflicts
      .pipe(gulp.dest('./'))                   // Without __dirname here = relative to cwd
      .pipe(install())                         // Run `bower install` and/or `npm install` if necessary
      .on('end', function() {
        done();                                // Finished!
      })
      .resume();
  });
});

gulp.task('extension-add-script', function() {
  var extensionName = gulp.args ? gulp.args[0] : 'example';
  var extension = {
    slugifyName: _s.slugify(extensionName),
  };

  gulp.src('./settings.json')
    .pipe(jeditor(function(json) {

      if (!json.extensions) {
        json.extensions = {};
      }

      json.extensions[extension.slugifyName] = {};

      return json;
    }))
    .pipe(gulp.dest('.'));

});

gulp.task('extension', ['extension-add-script'], function(done) {
  var extension = {};
  var extensionName = gulp.args ? gulp.args[0] : 'example';

  extension.slugifyName = _s.slugify(extensionName);
  extension.classifyName = _s.classify(extensionName);

  return es.concat(
    gulp.src(__dirname + '/extension/index.js')
      .pipe(template(extension))
      .pipe(rename(extension.slugifyName + '.js'))
      .pipe(conflict('./'))
      .pipe(gulp.dest('./extensions/' + extension.slugifyName)),

    gulp.src(__dirname + '/extension/index.extension.json')
      .pipe(template(extension))
      .pipe(rename(extension.slugifyName + '.extension.json'))
      .pipe(conflict('./'))
      .pipe(gulp.dest('./extensions/' + extension.slugifyName))
  );
});
