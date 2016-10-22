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
  // More options:
  // https://github.com/kangax/html-minifier#options-quick-reference

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
  // More options:
  // https://github.com/jakubpawlowicz/clean-css#how-to-use-clean-css-api

  return new _cleanCss2.default({}).minify(cssString).styles;
}

function compressJS(jsString) {
  // More options:
  // https://github.com/mishoo/UglifyJS2#compressor-options

  return (0, _uglifyJs.minify)(jsString, {
    fromString: true
  }).code;
}

function compressAMD(filename, option, callback) {
  var config = {
    baseUrl: _path2.default.dirname(filename),
    name: _path2.default.basename(filename, '.js'),
    out: '',
    optimize: 'none',
    mainConfigFile: '',
    findNestedDependencies: true
  };

  callback = _util2.default.isFunction(callback) ? callback : function () {};

  config = Object.assign(config, option || {});

  _requirejs2.default.optimize(config, function (buildResponse) {
    callback(null, buildResponse);
  }, function (err) {
    callback(err);
  });
}

function compileES6(filename) {
  var compiledJs = (0, _babelCore.transformFileSync)(filename, {
    extends: _path2.default.join(__dirname, '..', '.borutobrc')
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
    return ['define( function ( require, exports, module ) {', '\n' + body + '\nmodule.exports = ' + name + '\n', '});'].join('');
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
  compileES6: compileES6,
  compilePug: compilePug,
  compilePugToAMD: compilePugToAMD,
  compileStylus: compileStylus,
  walk: walk
};