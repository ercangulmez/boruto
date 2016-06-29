'use strict';

const bs = require('browser-sync');
const fs = require('fs-extra');
const path = require('path');
const watch = require('glob-watcher');
const getHtmlExtType = require('./get-html-ext-type');
const getStyleExtType = require('./get-style-ext-type');

module.exports = program => {
  program
    .command('server <directory>')
    .description('启动服务器 start server')
    .option('-p, --port <port>', '设置端口号(默认8080) config server port')
    .option('-d, --basedir <basedir>', '设置服务器目录 config server baseDir')
    .action((dir, options) => {

      // 端口号
      const port = options.port || 8080;

      // 服务器目录
      const basedir = options.basedir ? options.basedir.split(',').map(function (d) {
        return path.join(dir, d);
      }) : [];

      // 读取配置文件
      const config = fs.readJsonSync(path.join(dir, '.borutoConfig.json'));

      // 加载编译函数
      const compileHtml = require('./compiler/' + config.html);
      const compileCss = require('./compiler/' + config.css);
      const compileAmd = require('./compiler/' + config.amd + '-amd');

      let htmlExt = getHtmlExtType(config.html);
      let cssExt = getStyleExtType(config.css);
      let amdExt = getHtmlExtType(config.amd);

      // 监视路径
      const watchHtmlPath = dir + '/app/*.' + htmlExt;
      const watchCssPath = dir + '/app/stylesheets/*.' + cssExt;
      const watchAmdPath = dir + '/app/scripts/_template/*.' + amdExt;
      const watchJs = dir + '/app/scripts/**/*.js';

      // 暂存路径
      const distHtmlPath = dir + '/.tmp';
      const distCssPath = dir + '/.tmp/stylesheets';
      const distAmdPath = dir + '/.tmp/scripts/_template';

      compileHtml(watchHtmlPath, distHtmlPath)
        .then((msg) => {
          return compileCss(watchCssPath, distCssPath);
        })
        .then((msg) => {
          return compileAmd(watchAmdPath, distAmdPath);
        })
        .then((msg) => {

          // 初始化服务器
          bs.init({
            port: port,
            server: {
              baseDir: [dir + '/app', dir + '/.tmp'].concat(basedir)
            }
          });

        });

      watch(watchHtmlPath)
        .on('change', path => {
          compileHtml(path, distHtmlPath).then(() => {bs.reload()});
        })
        .on('add', path => {
          compileHtml(path, distHtmlPath).then(() => {bs.reload()});
        });

      watch(watchCssPath)
        .on('change', path => {
          compileCss(path, distCssPath).then(() => {bs.reload()});
        })
        .on('add', path => {
          compileCss(path, distCssPath).then(() => {bs.reload()});
        });

      watch(watchAmdPath)
        .on('change', path => {
          compileAmd(path, distAmdPath).then(() => {bs.reload()});
        })
        .on('add', path => {
          compileAmd(path, distAmdPath).then(() => {bs.reload()});
        });

      watch(watchJs).on('change', () => {bs.reload()}).on('add', () => {bs.reload()});

    });
};
