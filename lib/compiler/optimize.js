'use strict';

const fse = require('fs-extra');
const path = require('path');
const requirejs = require('requirejs');
const colors = require('colors');
const glob = require('../promise-glob');

module.exports = (from, to, mainConfigFile, compress) => {

  return glob(from)
    .then(files => {
      let queue = [];

      files.forEach(file => {

        const src = file;
        const dist = path.join(to, path.basename(file, '.js')) + '.js';

        queue.push(new Promise((resolve, reject) => {
          requirejs.optimize({
            baseUrl: path.dirname(file),
            name: path.basename(file, '.js'),
            out: dist,
            optimize: compress ? 'uglify' : 'none',
            mainConfigFile: mainConfigFile,
            findNestedDependencies: true,
            onBuildWrite: (moduleName, path, contents) => {
              // 删除调试用的模块随机数配置
              const pattern = 'urlArgs: "bust=" + (new Date()).getTime(),';
              return contents.replace(pattern, '');
            }
          }, buildResponse => {
            resolve('amd-optimized: '.cyan + dist.magenta);
          }, err => {
            reject(err);
          });
        }));

      });

      return Promise.all(queue);
    });
};
