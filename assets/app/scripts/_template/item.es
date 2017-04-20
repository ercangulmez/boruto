import _ from 'lodash';

export default list => {
  let items = [];
  _.each(list, item => {
    items.push(`<li>es6- ${ item }</li>`);
  });
  return `<ul>${ items.join('') }</ul>`;
};
