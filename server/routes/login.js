// Wetfish login example
var login = require("wetfish-login");

module.exports = function(required)
{
    var app = required.app;
    var config = required.config;
    var event = required.event;
    var model = required.model;

    login.init(config.login);

    app.get('/login', function(req, res)
    {
        if(!req.query.token)
        {
            res.redirect('https://login.wetfish.net/apps/join/' + config.login.app_id);
            return;
        }

        login.verify(req.query.token, function(verified)
        {
            if(verified.status != "success")
            {
                event.emit('message', req, res, {type: 'error', text: verified.message});
                return;
            }

            req.session.user = verified.data;
            event.emit('message', req, res, {type: 'success', text: "You're logged in!"});
        });
    });

    app.get('/logout', function(req, res)
    {
        event.emit('message', req, res, {type: 'success', text: "You're logged out!"});
        req.session.destroy();
    });
}
