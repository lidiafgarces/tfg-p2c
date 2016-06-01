// user model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');


var User = new Schema({
  username: String,
  email: String,
  center: String,
  delegation: String,
  role: String
});

User.plugin(passportLocalMongoose);


module.exports = mongoose.model('users', User);