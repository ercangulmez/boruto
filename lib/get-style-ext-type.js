'use strict';

module.exports = type => {
  switch (type) {
    case 'stylus':
      type = 'styl'
      break;
  }

  return type;
};
