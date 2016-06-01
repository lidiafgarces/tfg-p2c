var errorAdapter = require('error-adapter')
var q = require('q')
var exec = require('child_process').exec
var validate = require('./validate/archive-params')
module.exports = function(data, cb) {

  return validate(data)
    .then(archive)
    .nodeify(cb)

  function archive() {
    var deferred = q.defer()
    var repoPath = data.repoPath
    var outputPath = data.outputPath
    var command = buildCommand(data)
    var opts = {
      cwd: repoPath
    }
    exec(command, opts, function(err, stdout, stderr) {
      var error
      if (err) {
        error = errorAdapter.merge(err, {
          namespace: 'git-archive'
        })
        error.stdout = stdout
        error.stderr = stderr
        return deferred.reject(error)
      }
      return deferred.resolve(outputPath)
    })
    return deferred.promise
  }
};

function buildCommand(data) {
  var commit = data.commit
  var outputPath = data.outputPath
  var command = 'git archive -o ' + outputPath + ' ' + commit
  // allow optional flags to be passed
  if (data.flags) {
    command += ' ' + data.flags.join(' ')
  }
  return command
}
