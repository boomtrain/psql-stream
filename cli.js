#!/usr/bin/env node

var url = require('url')
var urlParseLax = require('url-parse-lax')
var pgStream = require('./')
var ndjson = require('ndjson')

var argv = require('minimist')(process.argv.slice(2), {
  alias: {
    host: 'h',
    port: 'p',
    username: 'U',
    password: 'W',
    command: 'c',
    dbname: 'd'
  },
  default: {host: 'localhost', port: 5432}
})

if (!argv.command || argv.help) {
  var usage = '' +
    'Usage: psql-stream [options]\n\n' +
    'psql-esque CLI that streams results to stdout\n\n' +
    'Options:\n\n' +
    '  -c, --command  SQL command to run\n' +
    '  -d, --dbname   database name to connect to\n' +
    '  -h, --host     database server host\n' +
    '  -p, --port     database server port\n' +
    '  -U, --username database user name\n' +
    '  -W, --password database user\'s password\n'
  return console.log(usage)
}

function createConnectionString (opts) {
  var u = urlParseLax(opts.host)

  u.protocol = 'postgres'

  if (opts.username || opts.password) u.auth = [opts.username, opts.password].join(':')
  if (opts.dbname) u.pathname = opts.dbname
  if (opts.port) u.port = opts.port

  // Clear `host` since it overrides `port`
  u.host = null

  return url.format(u)
}

var options = {
  connectionString: createConnectionString(argv),
  command: argv.command
}

pgStream(options, function (err, stream) {
  if (err) return console.log(err)

  stream
    .on('error', console.log)
    .pipe(ndjson.serialize())
    .pipe(process.stdout)
})
