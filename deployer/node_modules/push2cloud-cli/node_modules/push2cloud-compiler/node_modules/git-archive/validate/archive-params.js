var errorAdapter = require('error-adapter')
var fs = require('fs')
var q = require('q')

module.exports = function(params) {
  var errors = requiredParams().map(exists).filter(stripNull)

  if (errors.length > 0) {
    return q.fcall(function() {
      var error = errors[0]
      throw error
    })
  }
  return validateRepoPathExists(params)

  function exists(field) {
    var error
    if (!params[field]) {
      error = errorAdapter.create('field "' + field + '" is required', {
        namespace: 'git-archive'
      })
      error.field = field
    }
    return error
  }
};

function stripNull(error) {
  return error
}

function validateRepoPathExists(params) {
  var deferred = q.defer()
  var repoPath = params.repoPath
  fs.exists(repoPath, existsHandler)
  return deferred.promise

    function existsHandler(exists) {
      var error
      if (exists) {
        return deferred.resolve(params)
      }
      error = errorAdapter.create('repoPath does not exist on disk', {
        namespace: 'git-archive'
      })
      error.field = 'repoPath'
      error.repoPath = repoPath
      return deferred.reject(error)
    }
}

function requiredParams() {
  return ['commit', 'outputPath', 'repoPath']
}
