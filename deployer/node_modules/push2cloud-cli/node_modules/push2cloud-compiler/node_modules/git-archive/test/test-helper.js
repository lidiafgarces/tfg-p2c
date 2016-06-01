var chai = require('chai')
chai.Assertion.includeStack = true
var path = require('path')
var inspect = require('eyespect').inspector()

module.exports = {
  require: function(relativePath) {
    return require(path.join(__dirname, '..', relativePath))
  },

  inspect: inspect
}
