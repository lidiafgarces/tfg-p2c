exports.actions = function(app, options, repository) {
    var request = require("request");

    var itemRepo = repository.extend({
        collectionName: 'item'
    });

    // this is only a little hack for this sample when it should work with inMemory DB
    if (options.repository.type === 'inmemory') {
        itemRepo = require('../viewBuilders/collection').repository;
    }

    app.get('/', function(req, res) {
        console.log(req.signedCookies.authorized);
        if (req.signedCookies.authorized) {
            res.render('index');
        } else {
            res.redirect('/login');
        }
    });

    app.get('/login', function(req, res) {
        res.clearCookie('authorized');
        res.render('login');
    });

    app.get('/logout', function(req, res) {
        res.redirect('/login');
        res.clearCookie('authorized');
    });

    app.get('/index', function(req, res) {
        if (req.signedCookies.authorized) {
            res.render('index');
        } else {
            res.redirect('/login');
        }
    });

    app.get('/internships', function(req, res) {
        if (req.signedCookies.authorized) {
            res.render('internships');
        } else {
            res.redirect('/login');
        }
    });

    app.get('/internships/new', function(req, res) {
        if (req.signedCookies.authorized) {
            res.render('formo');
        } else {
            res.redirect('/login');
        }
    });

    app.get('/students', function(req, res) {
        if (req.signedCookies.authorized) {
            res.render('students');
        } else {
            res.redirect('/login');
        }
    });

    app.get('/students/new', function(req, res) {
        if (req.signedCookies.authorized) {
            res.render('students');
        } else {
            res.redirect('/login');
        }
    });

    app.get('/allItems.json', function(req, res) {
        if (req.signedCookies.authorized) {
            itemRepo.find(function(err, items) {
                if (err) res.json({});
                res.json(items);
            });
        } else {
            res.redirect('/login');
        }
    });

    app.get('/allReferences.json', function(req, res) {
        if (req.signedCookies.authorized) {
            itemRepo.find(function(err, items) {
                if (err) res.json({});
                var refs = [];
                for (var i = 0, len = items.length; i < len; i++) {
                    console.log(items[i]);
                    refs.push(items[i].attributes.ref);
                }
                res.json(refs);
            });
        } else {
            res.redirect('/login');
        }
    });

    app.get('/auth/cookie', function(req, res) {
        if (req.cookies.state === "logged") {
            res.cookie('authorized', 'true', { signed: true });
            res.clearCookie('state');
        }
        /*res.status(200).json({
            status: 'Login successful'
        });*/
        console.log('redirigimos');
        res.redirect('/');
    });

    app.post('/auth', function(req, res) {
        var url = 'http://localhost:8080/api/login';
        /*req.pipe(request.post(url, {
            username: req.body.username,
            password: req.body.password
        }), { end: false }).pipe(res);*/
        console.log(req.body.username);
        request.post(url, {
            username: req.body.username,
            password: req.body.password
        }, function(error, response, body) {
            if (!error && response.statusCode == 200) {
                res.status(200).json({
                    status: 'Login successful'
                });
            } else {
                console.log(response.statusCode);
                console.log(body);
                res.status(500).json({
                    err: 'Could not log in user'
                });
            }
        })
    });

};
