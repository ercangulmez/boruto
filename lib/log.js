'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _nodeLog = require('node-log.js');

var _nodeLog2 = _interopRequireDefault(_nodeLog);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initialize(type, file) {
  _nodeLog2.default.custom.apply(_nodeLog2.default, ['%s %s %s %s'].concat([_nodeLog.colors.green('√'), _nodeLog.colors.cyan(type + ':'), (0, _moment2.default)().format('YYYY-MM-DD hh:mm:ss:SSS'), _nodeLog.colors.magenta(file)]));
}

function server(type, file) {
  _nodeLog2.default.custom.apply(_nodeLog2.default, ['%s %s %s %s'].concat([_nodeLog.colors.red('!!!'), _nodeLog.colors.cyan(type + ':'), (0, _moment2.default)().format('YYYY-MM-DD hh:mm:ss:SSS'), _nodeLog.colors.magenta(file)]));
}

function dist(type, from, to) {
  _nodeLog2.default.custom.apply(_nodeLog2.default, ['%s %s %s %s => %s'].concat([_nodeLog.colors.green('√'), _nodeLog.colors.cyan(type + ':'), (0, _moment2.default)().format('YYYY-MM-DD hh:mm:ss:SSS'), _nodeLog.colors.yellow(from), _nodeLog.colors.magenta(to)]));
}

exports.default = {
  initialize: initialize,
  server: server,
  dist: dist,
  warn: _nodeLog2.default.warn,
  success: _nodeLog2.default.success,
  error: _nodeLog2.default.error
};