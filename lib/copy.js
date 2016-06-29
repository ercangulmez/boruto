'use strict';

const vfs = require('vinyl-fs');
const map = require('map-stream');
const path = require('path');

module.exports = (from, to) => {
  vfs.src(from)
    .pipe(map((file, cb) => {
      console.log('copyed: ' + path.join(to, path.basename(file.path)));
      cb(null, file);
    }))
    .pipe(vfs.dest(to));
};
