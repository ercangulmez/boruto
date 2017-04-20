#!/usr/bin/env node
'use strict';

require('babel-polyfill');

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

var _imagemin = require('imagemin');

var _imagemin2 = _interopRequireDefault(_imagemin);

var _imageminJpegtran = require('imagemin-jpegtran');

var _imageminJpegtran2 = _interopRequireDefault(_imageminJpegtran);

var _imageminPngquant = require('imagemin-pngquant');

var _imageminPngquant2 = _interopRequireDefault(_imageminPngquant);

var _boruto = require('../lib/boruto');

var _boruto2 = _interopRequireDefault(_boruto);

var _log = require('../lib/log');

var _log2 = _interopRequireDefault(_log);

var _package = require('../package.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var borutorc = '.borutorc.json';

var appDir = 'app';

var ignorePrefix = '_';
_commander2.default.version(_package.version);

_commander2.default.command('init [dir]').description('Initialize the app template.').action(_initializationHandler);

_commander2.default.command('server [dir]').description('The web server for boruto and thanks for browser-sync.').action(_serverHandler);

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
    middleware: function middleware(req, res) {
      var file = _url2.default.parse(req.url.slice(1)).pathname || 'index.html';
      var extname = _path2.default.extname(file);
      var reqFile = _path2.default.join(serverRoot, file);

      var pugFile = '';
      var stylusFile = '';
      var esFile = '';
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

          esFile = _replaceExtname(reqFile, extname, '.es');
          es6File = _replaceExtname(reqFile, extname, '.es6');
          pugFile = _replaceExtname(reqFile, extname, '.pug');

          if (_fs2.default.existsSync(reqFile)) {
            resContent = _fs2.default.readFileSync(reqFile);
          } else if (_fs2.default.existsSync(esFile)) {
            resContent = _boruto2.default.compileES(esFile);
          } else if (_fs2.default.existsSync(es6File)) {
            resContent = _boruto2.default.compileES(es6File);
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
  var distDir = _path2.default.join('..', config.distDir);
  var willOptimizeAmdModules = [];
  var willImageminImages = [];

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
        needRequirejsOptimizer: false,
        needImagemin: false
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
        case '.es':
        case '.es6':
          outInfo.content = _boruto2.default.compileES(filePath);
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
              outPath: distPath
            };
          } else {
            if (config.compress) {
              outInfo.content = _boruto2.default.compressJS(outInfo.content);
            }
          }

          break;
        case '.jpg':
        case '.png':
          outInfo.content = _fs2.default.readFileSync(filePath);
          outInfo.outpath = distPath;
          outInfo.needImagemin = {
            root: root,
            filePath: filePath,
            outPath: distPath
          };
          break;
        default:
          outInfo.content = _fs2.default.readFileSync(filePath);
          outInfo.outpath = distPath;
          break;
      }

      if (outInfo.needRequirejsOptimizer) {
        willOptimizeAmdModules.push(outInfo.needRequirejsOptimizer);
      } else if (outInfo.needImagemin) {
        willImageminImages.push(outInfo.needImagemin);
      } else {
        _fsExtra2.default.outputFileSync(outInfo.outpath, outInfo.content);
        _log2.default.dist('Distributed', _path2.default.resolve(filePath), _path2.default.resolve(outInfo.outpath));
      }
    }
  });

  _log2.default.success('\nDistributation is finished!\n');

  var _optimize = function () {
    var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _optimizeAMD();

            case 2:
              _context.next = 4;
              return _optimizeImage();

            case 4:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function _optimize() {
      return _ref.apply(this, arguments);
    };
  }();

  _optimize();

  function _optimizeImage() {
    if (willImageminImages.length > 0) {
      var queue = [];

      _log2.default.warn('\nImagemin images ...\n');

      willImageminImages.forEach(function (image) {
        queue.push((0, _imagemin2.default)([image.filePath], _path2.default.dirname(image.outPath), {
          plugins: [(0, _imageminJpegtran2.default)(), (0, _imageminPngquant2.default)({ quality: '65-80' })]
        }).then(function () {
          _log2.default.dist('Imagemin', _path2.default.resolve(image.filePath), _path2.default.resolve(image.outPath));
        }).catch(function (err) {
          _log2.default.error(err);
        }));
      });

      return Promise.all(queue).then(function () {
        _log2.default.success('\nImagemin images is finished ...\n');
      });
    } else {
      return Promise.resolve();
    }
  }
  function _optimizeAMD() {
    if (willOptimizeAmdModules.length > 0) {
      _log2.default.warn('\nOtimizing ...\n');

      var templateDir = config.templateDir || [];
      var moduleDir = config.moduleDir || [];
      var queue = [];

      var willBeRemoved = [];

      templateDir.concat(moduleDir).forEach(function (dir) {
        _boruto2.default.walk(_path2.default.join(root, dir), function (filePath) {
          var extname = _path2.default.extname(filePath);
          var distpath = _replaceExtname(filePath, extname, '.js');
          var content = '';

          switch (extname) {
            case '.es':
            case '.es6':
              content = _boruto2.default.compileES(filePath);
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

      willOptimizeAmdModules.forEach(function (module) {
        queue.push(_requirejsOptimize(module).then(function (removableFile) {
          willBeRemoved = willBeRemoved.concat(removableFile);

          if (config.compress) {
            _fsExtra2.default.outputFileSync(module.outPath, _boruto2.default.compressJS(_fs2.default.readFileSync(module.outPath, 'utf8')));
          }

          _log2.default.dist('Optimized', _path2.default.resolve(module.filePath), _path2.default.resolve(module.outPath));
        }));
      });

      return Promise.all(queue).then(function () {
        willBeRemoved.forEach(function (file) {
          _fs2.default.unlinkSync(file);
        });

        _log2.default.success('\nOtimizing is finished ...\n');
      });
    } else {
      return Promise.resolve();
    }
  }
}
function _requirejsOptimize(_ref2) {
  var root = _ref2.root,
      filePath = _ref2.filePath,
      outPath = _ref2.outPath;


  var extname = _path2.default.extname(filePath);
  var distpath = _replaceExtname(filePath, extname, '.js');
  var config = _getbrc(root).dist;
  var willBeRemoved = [];

  var option = {
    out: outPath,
    mainConfigFile: _path2.default.join(root, config.requirejsConfig)
  };

  var content = '';

  if (extname === '.es6' || extname === '.es') {
    content = _boruto2.default.compileES(filePath);
    willBeRemoved.push(distpath);
  } else {
    content = _fs2.default.readFileSync(filePath);
  }

  _fsExtra2.default.outputFileSync(distpath, content);

  return _boruto2.default.compressAMD(distpath, option).then(function () {
    return willBeRemoved;
  }).catch(function (err) {
    _log2.default.error(err.message);
  });
}
function _replaceExtname(pathName, oldExtname, newExtname) {
  return pathName.replace(new RegExp(oldExtname + '$', 'i'), newExtname);
}
function _getbrc(root) {
  var brc = _path2.default.join(root, borutorc);

  var config = {};

  if (_fs2.default.existsSync(brc)) {
    config = _fsExtra2.default.readJsonSync(brc, 'utf8');
  } else if (_fs2.default.existsSync('.borutorc')) {
    config = _fsExtra2.default.readJsonSync('.borutorc');
  } else {
    config = {};
  }

  return config;
}