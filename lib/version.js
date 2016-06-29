'use strict';

const pkg = require('../package.json');

module.exports = program => {
  program.version(pkg.version);
};
