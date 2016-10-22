import $ from 'jquery';
import _ from 'lodash';
import es6Item from '_template/item';
import pugItem from '_template/pugItem';

const list = [ 1, 2, 3, 4, 5, 6 ];

console.log( $().jquery, _.VERSION );

$( 'body' )
  .append( es6Item( list ) )
  .append( pugItem( { list: list } ) );
