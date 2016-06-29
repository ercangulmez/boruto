require(['./_amd/config'], function () {
  require(['logic']);
});

define('logic', function (require, exports, module) {
  var $ = require('jquery');
  var _ = require('underscore');
  var item = require('./_template/item');

  $('body').append(item({
    items: [1, 2, 3, 4, 5]
  }));

  console.log($().jquery, _.VERSION);
});
