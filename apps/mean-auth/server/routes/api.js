var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var passport = require('passport');

var User = require('../models/user.js');


router.post('/register', function(req, res) {
    var details = {
        username: req.body.username,
        email: req.body.email,
        center: req.body.center,
        delegation: req.body.delegation,
        role: req.body.role
    };
    User.register(new User(details),
        req.body.password,
        function(err, account) {
            if (err) {
                console.log(err);
                return res.status(500).json({
                    err: err
                });
            }
            passport.authenticate('local')(req, res, function() {
                return res.status(200).json({
                    status: 'Registration successful'
                });
            });
        });

});

router.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({
                err: info
            });
        }
        req.logIn(user, function(err) {
            if (err) {
                return res.status(500).json({
                    err: 'Could not log in user'
                });
            }
            res.setHeader('Access-Control-Allow-Origin','*');
            res.status(200).json({
                status: 'Login successful'
            });
        });
    })(req, res, next);
});

router.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            res.status(200).json({
                status: 'Logout succesful'
            });
        }
        res.status(200).json({
            status: 'Logout succesful'
        });
    });

});

router.delete('/delete/:username', function(req, res) {
    console.log(req.params);

    User.findOneAndRemove({ username: req.params.username }, function(err, user) {
        if (err) throw err;

        res.status(200).json({
            status: 'User successfully deleted!'
        });
    });
});



router.post('/edit', function(req, res, next) {
    User.findByUsername(req.body.username, function(err, user) {
        if (err) throw err;
        console.log('holis');
        console.log(user);
        user.username = req.body.username;
        user.email = req.body.email;
        user.center = req.body.center;
        user.delegation = req.body.delegation;
        user.role = req.body.role;
        console.log(user);
        user.save();
        res.status(200).json({
            status: 'User successfully updated'
        });
    });
});

router.post('/reset', function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(200).json({
            status: false,
        });
    }
    User.findByUsername(req.body.username, function(err, user) {
        if (err) throw err;
        console.log('holis');
        console.log(req.body);
        console.log(user);
        user.setPassword(req.body.password, function(err) {
            console.log(err);
            user.save();
            if (err) {
                console.log(err);
                return res.status(500).json({
                    err: err
                });
            }
            return res.status(200).json({
                status: 'Password successfully updated'
            });
        });
    });
});

router.get('/status', function(req, res) {
    if (!req.isAuthenticated()) {
        return res.status(200).json({
            status: false,
        });
    }
    var users = mongoose.model('users');
    users.find({}, function(err, data) {
        console.log(err, data, data.length);
        res.status(200).json({
            status: true,
            users: data
        });
    });
});

router.get('/users', function(req, res) {
    console.log('Authenticated: ' + req.isAuthenticated());
    if (!req.isAuthenticated()) {
        return res.status(200).json({
            status: false
        });
    }
    var users = mongoose.model('users');
    users.find({}, function(err, data) {
        console.log(err, data, data.length);
        res.status(200).json({
            status: true,
            users: data
        });
    });
});

router.get('/users/:username', function(req, res) {
    console.log(req.params);

    User.findByUsername(req.params.username, function(err, user) {
        console.log(user);
        res.status(200).json({
            status: 'User successfully found',
            user: user
        });
    });
});


module.exports = router;
