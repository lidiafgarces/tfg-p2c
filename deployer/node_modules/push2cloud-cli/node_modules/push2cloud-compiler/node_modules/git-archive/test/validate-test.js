var path = require('path')
var temp = require('temp')
var rimraf = require('rimraf')
var assert = require('assert')
var fs = require('fs')
var expect = require('chai').expect
var test = require('./test-helper')
var validate = test.require('validate/archive-params')

describe('Git Archive', function() {
  var params = validParams()

  before(function() {
    expect(fs.existsSync(params.repoPath)).to.be.true
  })
  beforeEach(function() {
    params = validParams()
  })

  Object.keys(params).forEach(validateFieldRequired);

  function validateFieldRequired(field) {
    it('should give error when "' + field + '" is not defined', function(done) {
      delete params[field]
      validate(params).then(function(params) {
        expect(params).to.not.exist
      })
        .fail(function(err) {
          expect(err).to.exist
          expect(err).to.have.ownProperty('field')
          expect(err.field).to.equal(field)
          done()
        }).done()
    })
  }



  it('should give error when repoPath does not exist on disk', function(done) {
    var repoPath = '/fake/repo/path'
    var errorExpected = new RegExp('git repo does not exist on disk at given repoPath: ' + repoPath)
    expect(fs.existsSync(repoPath)).to.be.false
    params.repoPath = repoPath

    validate(params)
      .then(function(params) {
        expect(params).to.not.exist
      })
      .fail(function(err) {
        expect(err).to.exist
        expect(err.repoPath).to.equal(params.repoPath)
        done()
      }).done()
  })

  // it('should archive bare repo to tarball at given output path', function(done) {

  //   params = {
  //     commit: '5de4caa20708131b1b29d3b6b3dea58e69d2c99c',
  //     outputPath: outputPath,
  //     repoPath: repoPath
  //   }
  //   gitArchive(params, function(err, reply) {
  //     should.not.exist(err)
  //     reply.should.eql(outputPath, 'reply should eql outputPath')
  //     assert.ok(fs.existsSync(outputPath), 'archive not found at output path: ' + outputPath)
  //     rimraf(outputPath, done)
  //   })
  // })

  // it('should give error when commit is invalid for given git repo', function(done) {
  //   var repoPath = path.join(__dirname, 'params/repos/apples_bare.git')
  //   var outputPath = temp.path({
  //     suffix: 'apples.tar.gz'
  //   })
  //   var params = {
  //     commit: 'fakeSha1Here',
  //     outputPath: outputPath,
  //     repoPath: repoPath
  //   }
  //   gitArchive(params, function(err, outputPath) {
  //     should.exist(err)
  //     err.message.should.eql('failed to archive git commit')
  //     should.exists(err.stderr)
  //     should.not.exist(outputPath, 'no reply should be returned')
  //     done()
  //   })
  // })
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
