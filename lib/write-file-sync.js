/**
 * Created by ryuu
 * @Email: 869058216@qq.com
 * @Blog: http://f2e-tlj.me
 * @Date: 2016/8/21
 */

'use strict';

const fs = require('fs-extra');
const path = require('path');
const colors = require('colors');

const writeFileSync = (filepath, contents) => {
  fs.outputFileSync(filepath, contents, 'utf8');
  console.log('created: '.cyan + path.resolve(filepath).magenta);
}

module.exports = writeFileSync;
