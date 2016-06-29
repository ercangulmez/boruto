// requirejs 配置文件
// 更多配置 http://requirejs.org/docs/api.html#config
require.config({
  // 用于开发调试时清理浏览器缓存
  urlArgs: "bust=" + (new Date()).getTime(),
  paths: {
    // http://jquery.com/
    jquery: '//cdn.bootcss.com/jquery/1.12.1/jquery.min',
    // http://jashkenas.github.io/underscore/
    underscore: '//cdn.bootcss.com/underscore.js/1.8.3/underscore-min',
    // http://github.com/pugjs/pug
    jade: '//cdn.bootcss.com/jade/1.11.0/runtime',
    // http://bluebirdjs.com/docs/getting-started.html
    bluebird: '//cdn.bootcss.com/bluebird/3.3.2/bluebird.min',
    // https://github.com/js-cookie/js-cookie
    cookie: '//cdn.bootcss.com/js-cookie/2.1.0/js.cookie.min',
    // https://github.com/blueimp/JavaScript-MD5
    md5: '//cdn.bootcss.com/blueimp-md5/2.3.0/js/md5.min'
  }
});
