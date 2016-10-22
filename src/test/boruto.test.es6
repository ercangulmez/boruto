import { spawn, spawnSync } from 'child_process';
import assert from 'assert';
import fse from 'fs-extra';
import path from 'path';
import boruto from '../lib/boruto';

const spawnConfig = {
  shell: true
};

const command = 'bin/boruto.js';
const testRoot = 'test/.tmp';

describe( 'Test is starting...', function () {
  
  this.timeout( 20000 );
  
  before( () => {
    spawnSync( command, [ 'init', testRoot ], spawnConfig );
  } );
  
  after( () => {
    fse.removeSync( path.join( __dirname, '..', testRoot ) );
  } );
  
  describe( 'Test `boruto init` ', () => {
    it( 'Should have all template files', () => {
      let allCount = 0;
      let sourceCount = 0;
      
      boruto.walk( path.join( __dirname, '../assets' ), () => { ++sourceCount } );
      boruto.walk( path.join( __dirname, '.tmp' ), () => { ++allCount } );
      
      assert.strictEqual( allCount, sourceCount );
    } );
  } );
  
  describe( 'Test `boruto server` ', () => {
    it( 'Should start server', done => {
      const server = spawn( command, [ 'server', testRoot ], spawnConfig );
      const stream = [];
      
      server.stdout.on( 'data', data => {
        stream.push( data );
        
        if ( stream.length === 1 ) {
          server.kill();
          done();
        }
      } );
    } );
  } );
  
  describe( 'Test `boruto dist` ', () => {
    const borutorc = path.join( __dirname, '..', 'assets', '.borutorc' );
    const distDir = fse.readJsonSync( borutorc ).dist.distDir;
    const ignoredFiles = [];
    
    it( 'Should have all distributed files in `<distDir>` without ignore files', () => {
      spawnSync( command, [ 'dist', testRoot ], spawnConfig );
      
      boruto.walk( path.join( testRoot, distDir ), file => {
        let ignore = file.split( path.sep ).find( item => {
          return item[ 0 ] === '_';
        } );
        
        ignore && ignoredFiles.push( ignore );
      } );
      
      assert.strictEqual( 0, ignoredFiles.length );
      
    } );
  } );
} );
