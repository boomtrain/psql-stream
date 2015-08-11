var pg = require('pg')
var queryStream = require('pg-query-readstream')
var eos = require('end-of-stream')

module.exports = function (opts, callback) {
  pg.connect(opts.connectionString, function (err, client, done) {
    if (err) return callback(err)

    var stream = queryStream(client.query(opts.command))

    eos(stream, client.end.bind(client))

    callback(null, stream)
  })
}
