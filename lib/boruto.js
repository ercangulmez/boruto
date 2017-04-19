'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _babelCore = require('babel-core');

var _pug = require('pug');

var _pug2 = _interopRequireDefault(_pug);

var _stylus = require('stylus');

var _stylus2 = _interopRequireDefault(_stylus);

var _nib = require('nib');

var _nib2 = _interopRequireDefault(_nib);

var _htmlMinifier = require('html-minifier');

var _cleanCss = require('clean-css');

var _cleanCss2 = _interopRequireDefault(_cleanCss);

var _uglifyJs = require('uglify-js');

var _requirejs = require('requirejs');

var _requirejs2 = _interopRequireDefault(_requirejs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function compressHTML(htmlString) {

  return (0, _htmlMinifier.minify)(htmlString, {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true
  });
}

function compressCSS(cssString) {

  return new _cleanCss2.default({}).minify(cssString).styles;
}

function compressJS(jsString) {

  return (0, _uglifyJs.minify)(jsString, {
    fromString: true
  }).code;
}

function compressAMD(filename, option) {
  var config = {
    baseUrl: _path2.default.dirname(filename),
    name: _path2.default.basename(filename, '.js'),
    out: '',
    optimize: 'none',
    mainConfigFile: '',
    findNestedDependencies: true
  };

  config = Object.assign(config, option || {});

  return new Promise(function (resolve, reject) {
    _requirejs2.default.optimize(config, function (buildResponse) {
      resolve(buildResponse);
    }, function (err) {
      reject(err);
    });
  });
}

function compileES(filename) {
  var compiledJs = (0, _babelCore.transformFileSync)(filename, {
    comments: false,
    extends: _path2.default.join(__dirname, '..', '.babelrc.boruto')
  }).code;

  return compiledJs;
}

function compilePug(filename) {
  var compiledString = _pug2.default.renderFile(filename, {
    pretty: true
  });

  return compiledString;
}

function compilePugToAMD(filename) {
  function _wrapper(body, name) {
    return ['define(function (require, exports, module) {', '\n' + body + '\nmodule.exports = ' + name + '\n', '})'].join('');
  }

  var name = _path2.default.basename(filename, '.pug').replace(/[\.\-]/g, '');

  var compiledString = _pug2.default.compileFileClient(filename, {
    pretty: true,
    debug: false,
    compileDebug: false,
    name: name
  });

  return _wrapper(compiledString, name);
}

function compileStylus(filename) {
  var compiledCss = (0, _stylus2.default)(_fs2.default.readFileSync(filename, 'utf8')).set('paths', [_path2.default.dirname(filename)]).set('include css', true).use((0, _nib2.default)()).import('nib').render();

  return compiledCss;
}

function walk(dir, callback) {
  var queue = [dir];

  var _loop = function _loop() {
    var subdir = queue.shift();
    _fs2.default.readdirSync(subdir).forEach(function (basename) {
      var srcPath = _path2.default.join(subdir, basename);

      if (_fs2.default.statSync(srcPath).isFile()) {
        _util2.default.isFunction(callback) && callback(srcPath, basename, dir);
      } else {
        queue.push(srcPath);
      }
    });
  };

  while (queue.length > 0) {
    _loop();
  }
}

exports.default = {
  compressHTML: compressHTML,
  compressCSS: compressCSS,
  compressJS: compressJS,
  compressAMD: compressAMD,
  compileES: compileES,
  compilePug: compilePug,
  compilePugToAMD: compilePugToAMD,
  compileStylus: compileStylus,
  walk: walk
};