var app = false;
var model = false;

module.exports = function(required)
{
    app = required.app;
    model = required.model;

    // Get list of channels
    model.channel.list(function(error, response)
    {
        console.log(error, response);
        console.log('hi');
        app.get('/', function(req, res)
        {
            res.render('index', {
                session: req.session,
                channels: response,
                partials: {
                    head: 'partials/head',
                    header: 'partials/header',
                    foot: 'partials/foot'
                }
            });
        });
    });
}
