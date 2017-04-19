import fs from 'fs'
import path from 'path'
import util from 'util'
import { transformFileSync } from 'babel-core'
import pug from 'pug'
import stylus from 'stylus'
import nib from 'nib'
import { minify as htmlMinifier } from 'html-minifier'
import CleanCSS from 'clean-css'
import { minify as uglifyJS } from 'uglify-js'
import requirejs from 'requirejs'

function compressHTML(htmlString) {
  // More options:
  // https://github.com/kangax/html-minifier#options-quick-reference

  return htmlMinifier(htmlString, {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    minifyCSS: true,
    minifyJS: true,
    removeComments: true
  })
}

function compressCSS(cssString) {
  // More options:
  // https://github.com/jakubpawlowicz/clean-css#how-to-use-clean-css-api

  return new CleanCSS({}).minify(cssString).styles
}

function compressJS(jsString) {
  // More options:
  // https://github.com/mishoo/UglifyJS2#compressor-options

  return uglifyJS(jsString, {
    fromString: true
  }).code
}

function compressAMD(filename, option) {
  let config = {
    baseUrl: path.dirname(filename),
    name: path.basename(filename, '.js'),
    out: '',
    optimize: 'none',
    mainConfigFile: '',
    findNestedDependencies: true
  }


  config = Object.assign(config, option || {})

  return new Promise((resolve, reject) => {
    requirejs.optimize(config, buildResponse => {
      resolve(buildResponse)
    }, err => {
      reject(err)
    })
  })
}

function compileES(filename) {
  const compiledJs = transformFileSync(filename, {
    comments: false,
    extends: path.join(__dirname, '..', '.babelrc.boruto')
  }).code

  return compiledJs
}

function compilePug(filename) {
  const compiledString = pug.renderFile(filename, {
    pretty: true
  })

  return compiledString
}

function compilePugToAMD(filename) {
  function _wrapper(body, name) {
    return [
      `define(function (require, exports, module) {`,
      `\n${ body }\nmodule.exports = ${ name }\n`,
      `})`
    ].join('')
  }

  const name = path.basename(filename, '.pug').replace(/[\.\-]/g, '')

  const compiledString = pug.compileFileClient(filename, {
    pretty: true,
    debug: false,
    compileDebug: false,
    name: name
  })

  return _wrapper(compiledString, name)
}

function compileStylus(filename) {
  const compiledCss = stylus(fs.readFileSync(filename, 'utf8'))
    .set('paths', [ path.dirname(filename) ])
    .set('include css', true)
    .use(nib())
    .import('nib')
    .render()

  return compiledCss
}

function walk(dir, callback) {
  const queue = [ dir ]

  while (queue.length > 0) {
    const subdir = queue.shift()
    fs.readdirSync(subdir).forEach(basename => {
      const srcPath = path.join(subdir, basename)

      if (fs.statSync(srcPath).isFile()) {
        util.isFunction(callback) && callback(srcPath, basename, dir)
      } else {
        queue.push(srcPath)
      }
    })
  }
}

export default {
  compressHTML,
  compressCSS,
  compressJS,
  compressAMD,
  compileES,
  compilePug,
  compilePugToAMD,
  compileStylus,
  walk
}
