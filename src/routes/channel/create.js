var events = require('events')
var action = new events.EventEmitter();

action.on('render', function(req, res, data)
{
    if(typeof data == "undefined")
        data = {};
    
    res.render('channel/create', {
        session: req.session,
        alert: data.alert,
        partials: {
            head: 'partials/head',
            header: 'partials/header',
            foot: 'partials/foot'
        }
    });
});

var app = false;
var model = false;

module.exports = function(required)
{
    app = required.app;
    model = required.model;

    app.get('/create', function(req, res)
    {
        console.log("GET: /create");

        if(typeof req.session.login == "undefined")
        {
            var alert = {class: 'alert', message: 'You must login to create a channel.'};
            action.emit('render', req, res, {alert: alert});
        }
        else
        {
            action.emit('render', req, res);
        }
    });

    app.post('/create', function(req, res)
    {
        console.log("GET: /create");
        res.end(JSON.stringify(req.body, null, 4));
    });
}
