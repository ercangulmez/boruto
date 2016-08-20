'use strict';

const fs = require('fs-extra');
const path = require('path');
const copy = require('./copy');
const writeFileSync = require('./write-file-sync');

module.exports = program => {

  program
    .command('init <directory>')
    .description('初始化模板 initialize boruto template')
    .option('    --html <type>', 'html模板(jade) html template(jade)')
    .option('-c, --css <type>', 'css样式模板(stylus) css template(stylus)')
    .option('-a, --amd <type>', '使用amd模块(jade) use amd(jade)')
    .action((dir, options) => {

      // 映射根目录
      const root = path.resolve(dir);
      // 资源目录
      const assets = path.join(__dirname, '..', 'assets');
      // 输出目录
      const dist = path.join(root, 'app');
      // 默认为jade
      const html = options.html || 'pug';
      // 默认为stylus
      const css = options.css || 'stylus';
      // amd模板
      const amd = options.amd || 'pug';

      // 配置文件内容
      let option = {
        html: html,
        css: css,
        amd: amd,
        mainConfigFile: path.join(root, 'app', 'scripts', '_amd', 'config.js')
      };

      // 复制资源文件
      copy(path.join(assets, html, '**/*'), dist);
      copy(path.join(assets, css, '**/*'), path.join(dist, 'stylesheets'));
      copy(path.join(assets, '.editorconfig'), root);
      copy(path.join(assets, 'amd', amd, '**/*'), path.join(dist, 'scripts', '_template'));
      copy(path.join(assets, 'amd', 'config.js'), path.join(root, 'app', 'scripts', '/_amd'));
      copy(path.join(assets, 'amd', 'index.js'), path.join(root, 'app', 'scripts'));
      copy(path.join(assets, 'images', '**/*'), path.join(root, 'app', 'images'));

      // 生成配置文件
      writeFileSync(path.join(root, '.borutoConfig.json'), JSON.stringify(option, '', 2));
      // 生成.gitignore文件
      const ignoreOption = [
        '.idea',
        '*.log',
        '.DS_Store',
        'node_modules',
        '.tmp',
        'dist'
      ].join('\n');
      writeFileSync(path.join(root, '.gitignore'), ignoreOption);
    });
}
