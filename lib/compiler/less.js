'use strict';

const stylus = require('stylus');
const fse = require('fs-extra');
const fs = require('fs');
const path = require('path');
const less = require('less');
const colors = require('colors');
const glob = require('../promise-glob');

module.exports = (from, to, compress) => {
  return glob(from)
    .then(files => {
      let queue = [];

      files.forEach(file => {
        const src = fs.readFileSync(file, 'utf8');
        const dist = path.join(to, path.basename(file, '.less')) + '.css';

        queue.push(new Promise((resolve, reject) => {
          less.render(src, {
            compress: !!compress
          }, (e, output) => {
            if (e) {
              reject(e);
            } else {
              fse.outputFile(dist, output.css, 'utf8', err => {
                if (err) {
                  reject(err);
                } else {
                  resolve('less-compiled: '.cyan + dist.magenta);
                }
              });
            }
          });
        }));
      });

      return Promise.all(queue);
    });
};
