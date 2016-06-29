'use strict';

const fse = require('fs-extra');
const pug = require('pug');
const path = require('path');
const glob = require('../promise-glob');

module.exports = (from, to) => {

  return glob(from)
    .then(files => {
      let queue = [];

      files.forEach(file => {
        const src = file;
        const dist = path.join(to, path.basename(file, '.pug')) + '.js';

        let compiledStr = pug.compileFileClient(src, {
          name: 'ryu',
          debug: false,
          compileDebug: false
        });

        // 使用amd格式
        compiledStr = 'define(function (require, exports, module) {' +
            compiledStr + ';module.exports = ryu;});';

        queue.push(new Promise((resolve, reject) => {
          fse.outputFile(dist, compiledStr, 'utf8', (err) => {
            if (err) {
              reject(err);
            } else {
              resolve('pug-client-compiled: ' + dist);
            }
          });
        }));
      });

      return Promise.all(queue);
    });
};
