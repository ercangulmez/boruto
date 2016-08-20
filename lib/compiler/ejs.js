'use strict';

const fse = require('fs-extra');
const fs = require('fs');
const ejs = require('ejs');
const path = require('path');
const colors = require('colors');
const minHtml = require('html-minifier').minify;
const glob = require('../promise-glob');

module.exports = (from, to, compress) => {

  return glob(from)
    .then(files => {
      let queue = [];

      files.forEach(file => {
        const src = file;
        const dist = path.join(to, path.basename(file, '.ejs')) + '.html';

        let compiledStr = ejs.render(fs.readFileSync(file, 'utf8'), {}, {
          filename: file
        });

        if (compress) {
          compiledStr = minHtml(compiledStr, {
            collapseWhitespace: true,
            removeComments: true,
            removeEmptyElements: true,
            minifyCSS: true,
            minifyJs: true
          });
        }

        queue.push(new Promise((resolve, reject) => {
          fse.outputFile(dist, compiledStr, 'utf8', (err) => {
            if (err) {
              reject(err);
            } else {
              resolve('ejs-compiled: '.cyan + dist.magenta);
            }
          });
        }));
      });

      return Promise.all(queue);
    });
};
