import { spawn, spawnSync, execFileSync } from 'child_process'
import assert from 'assert'
import fse from 'fs-extra'
import path from 'path'
import boruto from '../lib/boruto'

const commandRoot = path.join(__dirname, '../bin/boruto.js').split(path.sep).join('/')
const testRoot = path.join(__dirname, '../.borutotest').split(path.sep).join('/')
const assertsRoot = path.join(__dirname, '../assets').split(path.sep).join('/')

describe('Test is starting...', function() {

  this.timeout(20000)

  before(function() {
    spawnSync('node', [commandRoot, 'init', testRoot])
  })

  after(() => {
    fse.removeSync(testRoot)
  })

  describe('Test `boruto init` ', () => {
    it('Should have all template files', () => {
      let allCount = 0
      let sourceCount = 0

      boruto.walk(assertsRoot, () => {++sourceCount })
      boruto.walk(testRoot, () => {++allCount })

      assert.strictEqual(allCount, sourceCount)
    })
  })

  describe('Test `boruto server` ', () => {
    it('Should start server', done => {
      const server = spawn('node', [commandRoot, 'server', testRoot])
      const stream = []

      server.stdout.on('data', data => {
        stream.push(data)

        if (stream.length === 1) {
          server.kill()
          done()
        }
      })
    })
  })

  describe('Test `boruto dist` ', () => {
    const borutorc = path.join(assertsRoot, '.borutorc')
    const distDir = fse.readJsonSync(borutorc).dist.distDir
    const ignoredFiles = []

    it('Should have all distributed files in `<distDir>` without ignore files', () => {
      spawnSync('node', [commandRoot, 'dist', testRoot])

      boruto.walk(path.join(testRoot, distDir), file => {
        let ignore = file.split(path.sep).find(item => {
          return item[0] === '_'
        })

        ignore && ignoredFiles.push(ignore)
      })

      assert.strictEqual(0, ignoredFiles.length)

    })
  })
})
