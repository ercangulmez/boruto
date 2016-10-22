#!/usr/bin/env node
'use strict';

var _commander = require('commander');

var _commander2 = _interopRequireDefault(_commander);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _fsExtra = require('fs-extra');

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _browserSync = require('browser-sync');

var _browserSync2 = _interopRequireDefault(_browserSync);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _boruto = require('../lib/boruto');

var _boruto2 = _interopRequireDefault(_boruto);

var _log = require('../lib/log');

var _log2 = _interopRequireDefault(_log);

var _package = require('../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Boruto config
var borutorc = '.borutorc';
// App directory
var appDir = 'app';
// Ignore prefix
var ignorePrefix = '_';

_commander2.default.version(_package.version);

// Initialization
_commander2.default.command('init [dir]').description('Initialize the app template.').action(_initializationHandler);

// Server
_commander2.default.command('server [dir]').description('The web server for boruto and thanks for browser-sync.').action(_serverHandler);

// Dist
_commander2.default.command('dist [dir]').description('The web server for boruto and thanks for browser-sync.').action(_distHandler);

_commander2.default.parse(process.argv);

function _initializationHandler(dir) {
  _log2.default.warn('\nInitializing...\n');

  var root = dir || '.';
  var assetsDir = 'assets';

  _boruto2.default.walk(_path2.default.join(__dirname, '..', assetsDir), function (filePath, basename, dirname) {
    var outPath = _path2.default.resolve(filePath.replace(dirname, root));

    _fsExtra2.default.outputFileSync(outPath, _fs2.default.readFileSync(filePath));
    _log2.default.initialize('Created', outPath);
  });

  _log2.default.success('\nInitialization is finished!\n');
}

function _serverHandler(dir) {
  var root = dir || '.';
  var serverRoot = _path2.default.join(root, appDir);
  var config = _getbrc(root).server;

  (0, _browserSync2.default)(Object.assign({
    server: [serverRoot].concat(config.extDirs || []),
    middleware: function middleware(req, res, next) {
      var file = _url2.default.parse(req.url.slice(1)).pathname || 'index.html';
      var extname = _path2.default.extname(file);
      var reqFile = _path2.default.join(serverRoot, file);

      var pugFile = '';
      var stylusFile = '';
      var es6File = '';
      var resContent = '';

      switch (extname) {
        case '.html':
          res.setHeader('Content-Type', 'text/html');

          pugFile = _replaceExtname(reqFile, extname, '.pug');

          if (_fs2.default.existsSync(reqFile)) {
            resContent = _fs2.default.readFileSync(reqFile);
          } else if (_fs2.default.existsSync(pugFile)) {
            resContent = _boruto2.default.compilePug(pugFile);
          }
          break;

        case '.css':
          res.setHeader('Content-Type', 'text/css');

          stylusFile = _replaceExtname(reqFile, extname, '.styl');

          if (_fs2.default.existsSync(reqFile)) {
            resContent = _fs2.default.readFileSync(reqFile);
          } else if (_fs2.default.existsSync(stylusFile)) {
            resContent = _boruto2.default.compileStylus(stylusFile);
          }
          break;

        case '.js':
          res.setHeader('Content-Type', 'application/javascript');

          es6File = _replaceExtname(reqFile, extname, '.es6');
          pugFile = _replaceExtname(reqFile, extname, '.pug');

          if (_fs2.default.existsSync(reqFile)) {
            resContent = _fs2.default.readFileSync(reqFile);
          } else if (_fs2.default.existsSync(es6File)) {
            resContent = _boruto2.default.compileES6(es6File);
          } else if (_fs2.default.existsSync(pugFile)) {
            resContent = _boruto2.default.compilePugToAMD(pugFile);
          }
          break;

        default:
          if (_fs2.default.existsSync(reqFile)) {
            resContent = _fs2.default.readFileSync(reqFile);
          }
          break;
      }

      res.end(resContent);
    },
    files: [{
      match: [serverRoot],
      fn: function fn(event, file) {
        if (event === 'change') {
          _log2.default.server('Changed', _path2.default.resolve(file));
          _browserSync2.default.reload();
        }
      }
    }]
  }, config || {}));
}

function _distHandler(dir) {
  var root = _path2.default.join(dir || '.');
  var srcRoot = _path2.default.join(root, appDir);
  var config = _getbrc(root).dist;
  var distDir = _path2.default.join('..', config.distDir || 'dist');
  var willOptimizeAmdModules = [];

  _log2.default.warn('\nDistributing...\n');

  _boruto2.default.walk(srcRoot, function (filePath) {
    var distPath = _path2.default.join(srcRoot, filePath.replace(srcRoot, distDir));
    var filePathSep = filePath.split(_path2.default.sep);
    var ignorePath = filePathSep.find(function (sep) {
      return sep[0] === ignorePrefix;
    });
    var extname = _path2.default.extname(filePath);
    var amd = config.amdOptimizationDir.findIndex(function (dir) {
      return _path2.default.resolve(filePath).indexOf(_path2.default.resolve(_path2.default.join(root, dir))) >= 0;
    });

    if (!ignorePath) {
      var outInfo = {
        content: '',
        outpath: '',
        needRequirejsOptimizer: false
      };

      switch (extname) {
        case '.pug':
          outInfo.content = _boruto2.default.compilePug(filePath);
          outInfo.outpath = _replaceExtname(distPath, extname, '.html');

          if (config.compress) {
            outInfo.content = _boruto2.default.compressHTML(outInfo.content);
          }

          break;
        case '.styl':
          outInfo.content = _boruto2.default.compileStylus(filePath);
          outInfo.outpath = _replaceExtname(distPath, extname, '.css');

          if (config.compress) {
            outInfo.content = _boruto2.default.compressCSS(outInfo.content);
          }

          break;
        case '.es6':
          outInfo.content = _boruto2.default.compileES6(filePath);
          outInfo.outpath = _replaceExtname(distPath, extname, '.js');
          outInfo.needRequirejsOptimizer = {
            root: root,
            filePath: filePath,
            outPath: outInfo.outpath
          };
          break;
        case '.js':
          outInfo.content = _fs2.default.readFileSync(filePath, 'utf8');
          outInfo.outpath = distPath;

          if (amd !== -1) {
            outInfo.needRequirejsOptimizer = {
              root: root,
              filePath: filePath,
              outPath: outInfo.outpath
            };
          } else {
            if (config.compress) {
              outInfo.content = _boruto2.default.compressJS(outInfo.content);
            }
          }

          break;
        default:
          outInfo.content = _fs2.default.readFileSync(filePath);
          outInfo.outpath = distPath;
          break;
      }

      if (outInfo.needRequirejsOptimizer) {
        willOptimizeAmdModules.push(outInfo.needRequirejsOptimizer);
      } else {
        _fsExtra2.default.outputFileSync(outInfo.outpath, outInfo.content);
        _log2.default.dist('Distributed', _path2.default.resolve(filePath), _path2.default.resolve(outInfo.outpath));
      }
    }
  });

  _log2.default.success('\nDistributation is finished!\n');

  // Combine requirejs-base modules
  if (willOptimizeAmdModules.length > 0) {
    (function () {
      _log2.default.warn('\nOtimizing ...\n');

      var count = 0;

      willOptimizeAmdModules.forEach(function (module) {
        _requirejsOptimize(module, function (willBeRemoved) {

          ++count;

          if (config.compress) {
            _fsExtra2.default.outputFileSync(module.outPath, _boruto2.default.compressJS(_fs2.default.readFileSync(module.outPath, 'utf8')));
          }

          _log2.default.dist('Optimized', _path2.default.resolve(module.filePath), _path2.default.resolve(module.outPath));

          if (count === willOptimizeAmdModules.length) {
            willBeRemoved.forEach(function (file) {
              _fs2.default.unlink(file);
            });

            _log2.default.success('\nOtimizing is finished ...\n');
          }
        });
      });
    })();
  }
}

function _requirejsOptimize(_ref, callback) {
  var root = _ref.root;
  var filePath = _ref.filePath;
  var outPath = _ref.outPath;


  var extname = _path2.default.extname(filePath);
  var distpath = _replaceExtname(filePath, extname, '.js');
  var config = _getbrc(root).dist;
  var templateDir = config.templateDir || [];
  var willBeRemoved = [];

  if (_util2.default.isArray(templateDir)) {
    templateDir.forEach(function (dir) {
      _boruto2.default.walk(_path2.default.join(root, dir), function (filePath) {
        var extname = _path2.default.extname(filePath);
        var distpath = _replaceExtname(filePath, extname, '.js');
        var content = '';

        switch (extname) {
          case '.es6':
            content = _boruto2.default.compileES6(filePath);
            willBeRemoved.push(distpath);
            break;
          case '.pug':
            content = _boruto2.default.compilePugToAMD(filePath);
            willBeRemoved.push(distpath);
            break;
        }

        content && _fsExtra2.default.outputFileSync(distpath, content);
      });
    });
  }

  var option = {
    out: outPath,
    mainConfigFile: _path2.default.join(root, config.requirejsConfig)
  };

  var content = '';

  if (extname === '.es6') {
    content = _boruto2.default.compileES6(filePath);
  } else {
    content = _fs2.default.readFileSync(filePath);
  }

  _fsExtra2.default.outputFileSync(distpath, content);

  _boruto2.default.compressAMD(distpath, option, function (err, buildResponse) {
    if (err) {
      _log2.default.error(err.message);
    } else {
      _util2.default.isFunction(callback) && callback(willBeRemoved);
    }
  });
}

function _replaceExtname(pathName, oldExtname, newExtname) {
  return pathName.replace(new RegExp(oldExtname + '$', 'i'), newExtname);
}

function _getbrc(root) {
  var brc = _path2.default.join(root, borutorc);
  return _fs2.default.existsSync(brc) && _fsExtra2.default.readJsonSync(brc, 'utf8') || {};
}