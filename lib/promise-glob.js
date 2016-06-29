'use strict';

const glob = require('glob');

module.exports = (src) => {

  return new Promise((resolve, reject) => {
    glob(src, {}, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });

};
