// server.js is the starting point of the domain process:
//
// `node server.js` 
var colors = require('../colors'),
    msgbus = require('../msgbus');

var domain = require('cqrs-domain')({
    domainPath: __dirname + '/lib',
    eventStore: {
        type: 'redis', //'mongodb',
        dbName: 'cqrssample',
        host: 'pub-redis-18162.us-east-1-4.3.ec2.garantiadata.com',
        password: '1Aa8vlNScirgEnIT',
        port: '18162'
    }
});

domain.defineCommand({
    id: 'id',
    name: 'command',
    aggregateId: 'payload.id',
    payload: 'payload',
    revision: 'head.revision'
});
domain.defineEvent({
    correlationId: 'commandId',
    id: 'id',
    name: 'event',
    aggregateId: 'payload.id',
    payload: 'payload',
    revision: 'head.revision'
});

domain.init(function(err) {
    if (err) {
        return console.log(err);
    }

    // on receiving a message (__=command__) from msgbus pass it to 
    // the domain calling the handle function
    msgbus.onCommand(function(cmd) {
        console.log(colors.blue('\ndomain -- received command ' + cmd.command + ' from redis:'));
        console.log(cmd);
        console.log(colors.cyan('\n-> handle command ' + cmd.command));

        domain.handle(cmd);
    });

    // on receiving a message (__=event) from domain pass it to the msgbus
    domain.onEvent(function(evt) {
        console.log('domain: ' + evt.event);
        msgbus.emitEvent(evt);

        domain.eventStore.getEventStream('payload.id', function(err, stream) {
            var history = stream.events; // the original event will be in events[i].payload
            console.log(history);

            stream.addEvent(evt);
            //stream.commit();

            // myAggregate.loadFromHistory(history);
        });

    });

    //console.log(domain.getEventStream({aggregateId: 'payload.id'}));

    domain.eventStore.getEventStream('payload.id', function(err, stream) {
        var history = stream.events; // the original event will be in events[i].payload
        console.log(stream);
        // myAggregate.loadFromHistory(history);
    });

    console.log('Starting domain service'.cyan);
    //console.log(domain.getInfo().contexts[0]);
});
