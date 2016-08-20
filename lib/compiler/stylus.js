'use strict';

const stylus = require('stylus');
const nib = require('nib');
const fse = require('fs-extra');
const fs = require('fs');
const path = require('path');
const CleanCss = require('clean-css');
const colors = require('colors');
const glob = require('../promise-glob');

module.exports = (from, to, compress) => {
  return glob(from)
    .then(files => {
      let queue = [];

      files.forEach(file => {
        const src = fs.readFileSync(file, 'utf8');
        const dist = path.join(to, path.basename(file, '.styl')) + '.css';
        queue.push(new Promise((resolve, reject) => {

          stylus(src)
            .set('paths', [path.dirname(file)])
            .set('include css', true)
            .use(nib())
            .import('nib')
            .render((err, css) => {

              if (compress) {
                css = new CleanCss().minify(css).styles;
              }

              if (err) {
                reject(err);
              } else {
                fse.outputFile(dist, css, 'utf8', err => {
                  if (err) {
                    reject(err);
                  } else {
                    resolve('stylus-compiled: '.cyan + dist.magenta);
                  }
                });
              }
            });
        }));
      });

      return Promise.all(queue);
    });
};
