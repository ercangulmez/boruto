#!/usr/bin/env node

'use strict';

const program = require('commander');

require('../lib/version')(program);
require('../lib/init')(program);
require('../lib/server')(program);
require('../lib/dist')(program);

program.parse(process.argv);
