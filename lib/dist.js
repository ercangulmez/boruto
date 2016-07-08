'use strict';

const fs = require('fs-extra');
const path = require('path');
const del = require('del');
const copy = require('./copy');
const getHtmlExtType = require('./get-html-ext-type');
const getStyleExtType = require('./get-style-ext-type');

module.exports = program => {
  program
    .command('dist <directory>')
    .description('打包发布 dist project')
    .option('-o, --output <directory>', '设置输出目录 config output directory')
    .option('-c, --config <path>', '指定配置requirejs文件路劲 set path of reqiurejs config file')
    .action((dir, options) => {

      // 输出目录
      const output = options.output || path.join(dir, 'dist');

      // 读取配置文件
      const config = fs.readJsonSync(path.join(dir, '.borutoConfig.json'));

      // 加载编译函数
      const compileHtml = require('./compiler/' + config.html);
      const compileCss = require('./compiler/' + config.css);
      const compileAmd = require('./compiler/' + config.html + '-amd');
      const requirejsOptimize = require('./compiler/optimize');

      const htmlExt = getHtmlExtType(config.html);
      const cssExt = getStyleExtType(config.css);
      const amdExt = getHtmlExtType(config.amd);
      const mainConfigFile = (options.config && path.resolve(options.config)) || config.mainConfigFile;

      // 源路径
      const htmlSrc = dir + '/app/*.' + htmlExt;
      const cssSrc = dir + '/app/stylesheets/*.' + cssExt;
      const jsSrc = dir + '/app/scripts/*.js';
      const imagesSrc = dir + '/app/images/**/*';
      const amdSrc = dir + '/app/scripts/_template/*.' + htmlExt;

      // 发布路径
      const distHtmlPath = output;
      const distCssPath = output + '/stylesheets';
      const distJs = output + '/scripts';
      const distImages = output + '/images';
      const distAmd = dir + '/app/scripts/_template';

      // 复制静态资源
      copy(imagesSrc, distImages);

      // 编译流程
      compileHtml(htmlSrc, distHtmlPath, true)
        .then(msg => {
          console.log(msg.join('\n'));
          return compileCss(cssSrc, distCssPath, true);
        })
        .then(msg => {
          console.log(msg.join('\n'));
          return compileAmd(amdSrc, distAmd);
        })
        .then(msg => {
          console.log(msg.join('\n'));
          return requirejsOptimize(jsSrc, distJs, mainConfigFile, true);
        })
        .then(msg => {
          console.log(msg.join('\n'));
          return del(path.join(distAmd, '**/*.js'));
        })
        .catch(err => {
          console.log(err);
        });

    });
};
