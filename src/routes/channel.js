var app = false;
var model = false;

module.exports = function(required)
{
    app = required.app;
    model = required.model;

    app.get('/c/:channel', function(req, res)
    {
        // Get channel data
        model.channel.get({channel_url: req.params.channel}, function(error, response)
        {
            console.log(error, response);

            res.render('channel', {
                session: req.session,
                channel: req.params.channel,
                partials: {
                    head: 'partials/head',
                    header: 'partials/header',
                    foot: 'partials/foot'
                }
            });
        });
    });
}
