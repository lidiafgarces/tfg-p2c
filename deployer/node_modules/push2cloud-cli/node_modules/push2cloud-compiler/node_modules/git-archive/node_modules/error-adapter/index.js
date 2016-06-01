var errs = require('errs')

module.exports = {
	merge: merge,
	create: create
}

function merge(error, opts) {
	return errs.merge(error, opts)
}

function create(opts) {
	return errs.create(opts)
}

// policy/call-ready.js:var errs = require('errs')
// policy/fork-child-process.js:var errs = require('errs')
// policy/register-with-zookeeper.js:var errs = require('errs')
// policy/watch.js:var errs = require('errs')
// validate/params/start.js:var errs = require('errs')

// validate/params/start.js:      return errs.create({ description: 'missing field in params', field: field})

// policy/watch.js:        var error = errs.merge(err, { namespace: 'watch' })
// policy/register-with-zookeeper.js:    logThis.error = errs.merge(err, {namespace: 'registerWithZookeeper'})
// policy/fork-child-process.js:    logger.error('fail: child process died', errs.merge(err, { namespace: 'forkChildProcess' }))
// policy/call-ready.js:  var error = errs.merge(err, { namespace: 'callReady' })
