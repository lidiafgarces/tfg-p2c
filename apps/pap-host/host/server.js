// server.js is the starting point of the host process:
//
// `node server.js` 
var express = require('express'),
    cookieParser = require('cookie-parser'),
    http = require('http'),
    colors = require('../colors'),
    socket = require('socket.io'),
    viewmodel = require('viewmodel');


// create an configure:
//
// - express webserver
// - socket.io socket communication from/to browser
var app = express(),
    server = http.createServer(app),
    io = socket.listen(server);

app.use(require('body-parser').json());
app.use(cookieParser('guana'));
app.use(express['static'](__dirname + '/public'));

app.set('view engine', 'jade');
app.set('views', __dirname + '/app/views');

var uri = JSON.parse(process.env.VCAP_SERVICES).mlab[0].credentials.uri;
console.log(uri);

var test = uri.replace('mongodb://', '').split(':');
var test2 = test[1].split('@');
var test3 = test[2].split('/');
console.log(mongoCredentials);
var mongoCredentials = {
    'host': test2[1],
    'port': test3[0],
    'dbName': test3[1],
    'username': test[0],
    'password': test2[0]

};
console.log('Test 1:')
console.log(test);
console.log('Test 2:')
console.log(test2);
console.log('Test 3:')
console.log(test3);
console.log('Credentials:')
console.log(mongoCredentials);


// BOOTSTRAPPING
console.log('\nBOOTSTRAPPING:'.cyan);

var options = {
    denormalizerPath: __dirname + '/viewBuilders',
    /*repository: {
        type: 'inMemory', //'mongodb',
        dbName: 'cqrssample'
    },*/
    repository: {

        type: 'mongodb',
        host: mongoCredentials.host, // optional
        port: mongoCredentials.port, // optional
        dbName: mongoCredentials.dbName, // optional
        //authSource: 'db',       // optional
        username: mongoCredentials.username, // optional
        password: mongoCredentials.password // optional

    },
    revisionGuardStore: {
        type: 'inMemory', //'mongodb',
        dbName: 'cqrssample'
    }
};

console.log('1. -> viewmodel'.cyan);
viewmodel.write(options.repository, function(err, repository) {

    var eventDenormalizer = require('cqrs-eventdenormalizer')(options);

    eventDenormalizer.defineEvent({
        correlationId: 'commandId',
        id: 'id',
        name: 'event',
        aggregateId: 'payload.id',
        payload: 'payload',
        revision: 'head.revision'
    });

    console.log('2. -> eventdenormalizer'.cyan);
    eventDenormalizer.init(function(err) {
        if (err) {
            console.log(err);
        }

        console.log('3. -> routes'.cyan);
        require('./app/routes').actions(app, options, repository);

        console.log('4. -> message bus'.cyan);
        var msgbus = require('../msgbus');

        // on receiving an __event__ from redis via the hub module:
        //
        // - let it be handled from the eventDenormalizer to update the viewmodel storage
        msgbus.onEvent(function(data) {
            console.log(colors.cyan('eventDenormalizer -- denormalize event ' + data.event));
            eventDenormalizer.handle(data);
        });

        // on receiving an __event__ from eventDenormalizer module:
        //
        // - forward it to connected browsers via socket.io
        eventDenormalizer.onEvent(function(evt) {
            console.log(colors.magenta('\nsocket.io -- publish event ' + evt.event + ' to browser'));
            io.sockets.emit('events', evt);
        });

        // SETUP COMMUNICATION CHANNELS

        // on receiving __commands__ from browser via socket.io emit them on the ĥub module (which will 
        // forward it to message bus (redis pubsub))
        io.sockets.on('connection', function(socket) {
            console.log(colors.magenta(' -- connects to socket.io'));

            socket.on('commands', function(data) {
                console.log(colors.magenta('\n -- sends command ' + data.command + ':'));
                console.log(data);

                msgbus.emitCommand(data);
            });

            socket.on('error', function(err) {
                console.log("Socket.IO Error");
                console.log(err.stack); // this is changed from your code in last comment
            });
        });



        // START LISTENING
        var port = process.env.PORT || 3000;
        console.log(colors.cyan('\nStarting server on port ' + port));
        console.log('Mongo credentials: ');
        
        server.listen(port);
    });
});
