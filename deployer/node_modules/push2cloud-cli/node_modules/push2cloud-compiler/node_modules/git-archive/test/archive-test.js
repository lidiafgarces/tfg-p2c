var path = require('path')
var temp = require('temp')
var rimraf = require('rimraf')
var fs = require('fs')
var expect = require('chai').expect

var test = require('./test-helper')
var gitArchive = test.require('./')

describe('Git Archive', function() {
  var params = validParams()

  before(function() {
    expect(fs.existsSync(params.repoPath)).to.be.true
  })
  beforeEach(function() {
    params = validParams()
  })


  it('should archive bare repo to tarball at given output path using a promise', function(done) {
    gitArchive(params)
      .then(function(outputPath) {
        expect(outputPath).to.exist
        expect(outputPath).to.equal(params.outputPath)
        expect(fs.existsSync(outputPath), 'archive not found at output path: ' + outputPath)
        rimraf(outputPath, done)
      })
      .fail(function(err) {
        test.inspect(err, 'archive failed')
        expect(err).to.not.exist
      }).done()
  })

  it('should archive bare repo to tarball at given output path using a callback', function(done) {
    gitArchive(params, function(err, outputPath) {
      expect(err).to.not.exist
      expect(outputPath).to.exist
      expect(outputPath).to.equal(params.outputPath)
      expect(fs.existsSync(outputPath), 'archive not found at output path: ' + outputPath)
      rimraf(outputPath, done)
    })
  })

  it('should give error when commit is invalid for given git repo', function(done) {
    var repoPath = path.join(__dirname, 'params/repos/apples_bare.git')
    var outputPath = temp.path({
      suffix: 'apples.tar.gz'
    })
    var params = {
      commit: 'fakeSha1Here',
      outputPath: outputPath,
      repoPath: repoPath
    }
    gitArchive(params)
      .then(function(outputPath) {
        expect(outputPath).to.not.exist
      })
      .fail(function(err) {
        expect(err).to.exist
        done()
      }).done()
  })
});


function validParams() {
  var repoPath = path.join(__dirname, 'data/repos/apples_bare.git')
  var outputPath = temp.path({
    suffix: 'apples.tar.gz'
  })

  return {
    commit: '5de4caa20708131b1b29d3b6b3dea58e69d2c99c',
    outputPath: outputPath,
    repoPath: repoPath
  }

}
