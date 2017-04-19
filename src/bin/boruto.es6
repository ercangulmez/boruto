#!/usr/bin/env node
import 'babel-polyfill'
import program from 'commander'
import path from 'path'
import fs from 'fs'
import fse from 'fs-extra'
import browserSync from 'browser-sync'
import url from 'url'
import imagemin from 'imagemin'
import imageminJpegtran from 'imagemin-jpegtran'
import imageminPngquant from 'imagemin-pngquant'
import boruto from '../lib/boruto'
import log from '../lib/log'
import { version } from '../package.json'
// Boruto config
const borutorc = '.borutorc.json'
// App directory
const appDir = 'app'
// Ignore prefix
const ignorePrefix = '_'
program.version(version)
// Initialization
program
  .command('init [dir]')
  .description('Initialize the app template.')
  .action(_initializationHandler)
// Server
program
  .command('server [dir]')
  .description('The web server for boruto and thanks for browser-sync.')
  .action(_serverHandler)
// Dist
program
  .command('dist [dir]')
  .description('The web server for boruto and thanks for browser-sync.')
  .action(_distHandler)
program.parse(process.argv)
function _initializationHandler(dir) {
  log.warn('\nInitializing...\n')

  const root = dir || '.'
  const assetsDir = 'assets'

  boruto.walk(path.join(__dirname, '..', assetsDir), (filePath, basename, dirname) => {
    const outPath = path.resolve(filePath.replace(dirname, root))

    fse.outputFileSync(outPath, fs.readFileSync(filePath))
    log.initialize('Created', outPath)
  })

  log.success('\nInitialization is finished!\n')
}
function _serverHandler(dir) {
  const root = dir || '.'
  const serverRoot = path.join(root, appDir)
  const config = _getbrc(root).server

  browserSync(Object.assign({
    server: [ serverRoot ].concat(config.extDirs || []),
    middleware: (req, res) => {
      const file = url.parse(req.url.slice(1)).pathname || 'index.html'
      const extname = path.extname(file)
      const reqFile = path.join(serverRoot, file)

      let pugFile = ''
      let stylusFile = ''
      let esFile = ''
      let es6File = ''
      let resContent = ''

      switch (extname) {
        case '.html':
          res.setHeader('Content-Type', 'text/html')

          pugFile = _replaceExtname(reqFile, extname, '.pug')

          if (fs.existsSync(reqFile)) {
            resContent = fs.readFileSync(reqFile)
          } else if (fs.existsSync(pugFile)) {
            resContent = boruto.compilePug(pugFile)
          }
          break

        case '.css':
          res.setHeader('Content-Type', 'text/css')

          stylusFile = _replaceExtname(reqFile, extname, '.styl')

          if (fs.existsSync(reqFile)) {
            resContent = fs.readFileSync(reqFile)
          } else if (fs.existsSync(stylusFile)) {
            resContent = boruto.compileStylus(stylusFile)
          }
          break

        case '.js':
          res.setHeader('Content-Type', 'application/javascript')

          esFile = _replaceExtname(reqFile, extname, '.es')
          es6File = _replaceExtname(reqFile, extname, '.es6')
          pugFile = _replaceExtname(reqFile, extname, '.pug')

          if (fs.existsSync(reqFile)) {
            resContent = fs.readFileSync(reqFile)
          } else if (fs.existsSync(esFile)) {
            resContent = boruto.compileES(esFile)
          } else if (fs.existsSync(es6File)) {
            resContent = boruto.compileES(es6File)
          } else if (fs.existsSync(pugFile)) {
            resContent = boruto.compilePugToAMD(pugFile)
          }
          break

        default:
          if (fs.existsSync(reqFile)) {
            resContent = fs.readFileSync(reqFile)
          }
          break
      }

      res.end(resContent)
    },
    files: [
      {
        match: [ serverRoot ],
        fn: (event, file) => {
          if (event === 'change') {
            log.server('Changed', path.resolve(file))
            browserSync.reload()
          }
        }
      }
    ]
  }, config || {}))
}
function _distHandler(dir) {
  const root = path.join(dir || '.')
  const srcRoot = path.join(root, appDir)
  const config = _getbrc(root).dist
  const distDir = path.join('..', config.distDir)
  const willOptimizeAmdModules = []
  const willImageminImages = []

  log.warn('\nDistributing...\n')

  boruto.walk(srcRoot, filePath => {
    const distPath = path.join(srcRoot, filePath.replace(srcRoot, distDir))
    const filePathSep = filePath.split(path.sep)
    const ignorePath = filePathSep.find(sep => { return sep[ 0 ] === ignorePrefix })
    const extname = path.extname(filePath)
    const amd = config.amdOptimizationDir.findIndex(dir => {
      return path.resolve(filePath).indexOf(path.resolve(path.join(root, dir))) >= 0
    })

    if (!ignorePath) {
      const outInfo = {
        content: '',
        outpath: '',
        needRequirejsOptimizer: false,
        needImagemin: false
      }

      switch (extname) {
        case '.pug':
          outInfo.content = boruto.compilePug(filePath)
          outInfo.outpath = _replaceExtname(distPath, extname, '.html')

          if (config.compress) {
            outInfo.content = boruto.compressHTML(outInfo.content)
          }

          break
        case '.styl':
          outInfo.content = boruto.compileStylus(filePath)
          outInfo.outpath = _replaceExtname(distPath, extname, '.css')

          if (config.compress) {
            outInfo.content = boruto.compressCSS(outInfo.content)
          }

          break
        case '.es':
        case '.es6':
          outInfo.content = boruto.compileES(filePath)
          outInfo.outpath = _replaceExtname(distPath, extname, '.js')
          outInfo.needRequirejsOptimizer = {
            root,
            filePath,
            outPath: outInfo.outpath
          }
          break
        case '.js':
          outInfo.content = fs.readFileSync(filePath, 'utf8')
          outInfo.outpath = distPath

          if (amd !== -1) {
            outInfo.needRequirejsOptimizer = {
              root,
              filePath,
              outPath: distPath
            }
          } else {
            if (config.compress) {
              outInfo.content = boruto.compressJS(outInfo.content)
            }
          }

          break
        case '.jpg':
        case '.png':
          outInfo.content = fs.readFileSync(filePath)
          outInfo.outpath = distPath
          outInfo.needImagemin = {
            root,
            filePath,
            outPath: distPath
          }
          break
        default:
          outInfo.content = fs.readFileSync(filePath)
          outInfo.outpath = distPath
          break
      }

      if (outInfo.needRequirejsOptimizer) {
        willOptimizeAmdModules.push(outInfo.needRequirejsOptimizer)
      } else if (outInfo.needImagemin) {
        willImageminImages.push(outInfo.needImagemin)
      } else {
        fse.outputFileSync(outInfo.outpath, outInfo.content)
        log.dist('Distributed', path.resolve(filePath), path.resolve(outInfo.outpath))
      }

    }

  })

  log.success('\nDistributation is finished!\n')

  const _optimize = async function () {
    await _optimizeAMD()
    await _optimizeImage()
  }

  _optimize()

  function _optimizeImage() {
    // Imagemin images
    if (willImageminImages.length > 0) {
      const queue = []

      log.warn('\nImagemin images ...\n')

      willImageminImages.forEach(image => {
        queue.push(imagemin([image.filePath], path.dirname(image.outPath), {
          plugins: [
            imageminJpegtran(),
            imageminPngquant({ quality: '65-80' })
          ]
        })
        .then(() => {
          log.dist('Imagemin', path.resolve(image.filePath), path.resolve(image.outPath))
        })
        .catch(err => {
          log.error(err)
        }))
      })

      return Promise
        .all(queue)
        .then(() => {
          log.success('\nImagemin images is finished ...\n')
        })
    } else {
      return Promise.resolve()
    }
  }
  function _optimizeAMD() {
    // Combine requirejs-base modules
    if (willOptimizeAmdModules.length > 0) {
      log.warn('\nOtimizing ...\n')

      const templateDir = config.templateDir || []
      const moduleDir = config.moduleDir || []
      const queue = []

      let willBeRemoved = []

      templateDir.concat(moduleDir).forEach(dir => {
        boruto.walk(path.join(root, dir), filePath => {
          const extname = path.extname(filePath)
          const distpath = _replaceExtname(filePath, extname, '.js')
          let content = ''

          switch (extname) {
            case '.es':
            case '.es6':
              content = boruto.compileES(filePath)
              willBeRemoved.push(distpath)
              break
            case '.pug':
              content = boruto.compilePugToAMD(filePath)
              willBeRemoved.push(distpath)
              break
          }

          content && fse.outputFileSync(distpath, content)
        })
      })

      willOptimizeAmdModules.forEach(module => {
        queue.push(_requirejsOptimize(module).then(removableFile => {
          willBeRemoved = willBeRemoved.concat(removableFile)

          if (config.compress) {
            fse.outputFileSync(module.outPath, boruto.compressJS(fs.readFileSync(module.outPath, 'utf8')))
          }

          log.dist('Optimized', path.resolve(module.filePath), path.resolve(module.outPath))
        }))
      })

      return Promise
        .all(queue)
        .then(() => {
          willBeRemoved.forEach(file => {
            fs.unlinkSync(file)
          })

          log.success('\nOtimizing is finished ...\n')
        })
    } else {
      return Promise.resolve()
    }
  }
}
function _requirejsOptimize({ root, filePath, outPath }) {

  const extname = path.extname(filePath)
  const distpath = _replaceExtname(filePath, extname, '.js')
  const config = _getbrc(root).dist
  const willBeRemoved = []

  const option = {
    out: outPath,
    mainConfigFile: path.join(root, config.requirejsConfig)
  }

  let content = ''

  if (extname === '.es6' || extname === '.es') {
    content = boruto.compileES(filePath)
    willBeRemoved.push(distpath)
  } else {
    content = fs.readFileSync(filePath)
  }

  fse.outputFileSync(distpath, content)

  return boruto
    .compressAMD(distpath, option)
    .then(() => { return willBeRemoved })
    .catch(err => { log.error(err.message) })
}
function _replaceExtname(pathName, oldExtname, newExtname) {
  return pathName.replace(new RegExp(oldExtname + '$', 'i'), newExtname)
}
function _getbrc(root) {
  const brc = path.join(root, borutorc)

  let config = {};

  if (fs.existsSync(brc)) {
    config = fse.readJsonSync(brc, 'utf8');
  } else if (fs.existsSync('.borutorc')) {
    config = fse.readJsonSync('.borutorc');
  } else {
    config = {};
  }

  return config;
}
