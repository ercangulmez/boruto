'use strict';

const vfs = require('vinyl-fs');
const map = require('map-stream');
const path = require('path');
const colors = require('colors');

module.exports = (from, to) => {
  vfs.src(from)
    .pipe(map((file, cb) => {
      console.log('created: '.cyan + path.join(to, path.basename(file.path)).magenta);
      cb(null, file);
    }))
    .pipe(vfs.dest(to));
};
