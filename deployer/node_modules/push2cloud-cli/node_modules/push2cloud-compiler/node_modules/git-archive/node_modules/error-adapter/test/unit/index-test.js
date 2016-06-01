var help = require('./test-helper')
var expect = help.expect
var errorAdapter = help.require('index')

describe('ErrorAdapter', function() {

	['create', 'merge'].forEach(function(fnName){
		it('should export '+ fnName, function() {
			expect(errorAdapter[fnName]).to.be.a('function')
		})
	})

	describe('create', function() {
		it('should create a new error from an object', function() {
			var subject = errorAdapter.create({some: 'thing'})

			expect(subject).to.have.ownProperty('some')
			expect(subject.some).to.equal('thing')
			expect(subject).to.be.instanceof(Error)
			expect(subject.description).to.be.empty
		})

		it('should pass an existing error through', function() {
			var existing = new Error("this is a message")
			var subject = errorAdapter.create(existing)

			expect(subject).to.have.ownProperty('message')
			expect(subject.message).to.equal('this is a message')
			expect(subject).to.be.instanceof(Error)
			expect(subject.description).to.be.empty
		})
	})

	describe('merge', function() {

		it('should merge opts into an existing error', function() {
			var existing = new Error('original message')
			var subject = errorAdapter.merge(existing, {something: 'new'})

			expect(subject).to.have.ownProperty('something')
			expect(subject.something).to.equal('new')
			expect(subject).to.be.instanceof(Error)
			expect(existing.message).to.equal('original message')
			expect(subject.description).to.equal('original message')
			expect(subject.message).to.equal('Unspecified error')
		})

		it('should override the message with a new message, and move the old message to description', function() {
			var existing = new Error('original message')
			var subject = errorAdapter.merge(existing, {message: 'new message'})

			expect(subject.description).to.equal(existing.message)
			expect(subject.message).to.not.equal(existing.message)
			expect(subject.message).to.equal('new message')
		})

	})

})

