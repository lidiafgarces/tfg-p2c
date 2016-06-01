var expect = require('chai').expect

module.exports = {
	require: requireCode,
	expect: expect
}

function requireCode(path) {
	return require(__dirname + '/../../' + path)
}

