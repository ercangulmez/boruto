import log, { colors } from 'node-log.js'
import moment from 'moment'

function initialize(type, file) {
  log.custom('%s %s %s %s', ...[
    colors.green('√'),
    colors.cyan(`${ type }:`),
    moment().format('YYYY-MM-DD hh:mm:ss:SSS'),
    colors.magenta(file)
  ])
}

function server(type, file) {
  log.custom('%s %s %s %s', ...[
    colors.red('!!!'),
    colors.cyan(`${ type }:`),
    moment().format('YYYY-MM-DD hh:mm:ss:SSS'),
    colors.magenta(file)
  ])
}

function dist(type, from, to) {
  log.custom('%s %s %s %s => %s', ...[
    colors.green('√'),
    colors.cyan(`${ type }:`),
    moment().format('YYYY-MM-DD hh:mm:ss:SSS'),
    colors.yellow(from),
    colors.magenta(to)
  ])
}

export default {
  initialize,
  server,
  dist,
  warn: log.warn,
  success: log.success,
  error: log.error
}
