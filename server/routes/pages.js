module.exports = function(server)
{
    var app = server.app;
    var config = server.config;
    var event = server.event;
    var model = server.model;

    app.get('/', function(req, res)
    {
        event.emit('render', req, res, {view: 'index', hello: 'world'});
    });

    app.get('/example', function(req, res)
    {
        event.emit('render', req, res, {view: 'example'});
    });
}
