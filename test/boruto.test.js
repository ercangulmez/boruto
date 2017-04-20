'use strict';

var _child_process = require('child_process');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _boruto = require('../lib/boruto');

var _boruto2 = _interopRequireDefault(_boruto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var commandRoot = _path2.default.join(__dirname, '../bin/boruto.js').split(_path2.default.sep).join('/');
var testRoot = _path2.default.join(__dirname, '../.borutotest').split(_path2.default.sep).join('/');
var assertsRoot = _path2.default.join(__dirname, '../assets').split(_path2.default.sep).join('/');

describe('Test is starting...', function () {

  this.timeout(20000);

  before(function () {
    (0, _child_process.spawnSync)('node', [commandRoot, 'init', testRoot]);
  });

  after(function () {
    _fsExtra2.default.removeSync(testRoot);
  });

  describe('Test `boruto init` ', function () {
    it('Should have all template files', function () {
      var allCount = 0;
      var sourceCount = 0;

      _boruto2.default.walk(assertsRoot, function () {
        ++sourceCount;
      });
      _boruto2.default.walk(testRoot, function () {
        ++allCount;
      });

      _assert2.default.strictEqual(allCount, sourceCount);
    });
  });

  describe('Test `boruto server` ', function () {
    it('Should start server', function (done) {
      var server = (0, _child_process.spawn)('node', [commandRoot, 'server', testRoot]);
      var stream = [];

      server.stdout.on('data', function (data) {
        stream.push(data);

        if (stream.length === 1) {
          server.kill();
          done();
        }
      });
    });
  });

  describe('Test `boruto dist` ', function () {
    var borutorc = _path2.default.join(assertsRoot, '.borutorc.json');
    var distDir = _fsExtra2.default.readJsonSync(borutorc).dist.distDir;
    var ignoredFiles = [];

    it('Should have all distributed files in `<distDir>` without ignore files', function () {
      (0, _child_process.spawnSync)('node', [commandRoot, 'dist', testRoot]);

      _boruto2.default.walk(_path2.default.join(testRoot, distDir), function (file) {
        var ignore = file.split(_path2.default.sep).find(function (item) {
          return item[0] === '_';
        });

        ignore && ignoredFiles.push(ignore);
      });

      _assert2.default.strictEqual(0, ignoredFiles.length);
    });
  });
});