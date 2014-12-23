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
            var template =
            {
                session: req.session,
                channel: response,
                partials: {
                    head: 'partials/head',
                    header: 'partials/header',
                    foot: 'partials/foot'
                }
            }

            if(response.length)
                template.channel = response[0];
            else
                template.alert = {'class': 'alert', 'message': 'Sorry, this channel does not exist!'};
            
            res.render('channel', template);
        });
    });
}
