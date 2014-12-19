var events = require('events')
var action = new events.EventEmitter();

action.on('render', function(req, res, data)
{
    if(typeof data == "undefined")
        data = {};
    
    res.render('login', {
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
var login = false;

module.exports = function(required)
{
    app = required.app;
    model = required.model;
    login = required.login;

    app.get('/login', function(req, res)
    {
        console.log("GET: /login");
        var alert = {};

        if(typeof req.session.user != "undefined")
        {
            alert.class = "alert";
            alert.message = "You're already logged in!";
            action.emit('render', req, res, {alert: alert});
            return;
        }
        
        login.verify(req.query.token, function(verified)
        {
            if(verified.status == "success")
            {
                var user_data =
                {
                    fish_id: verified.data.user_id,
                    username: verified.data.user_name,
                    email: verified.data.user_email
                };
                
                model.user.login(user_data, function(error, response)
                {
                    alert.class = "success";
                    alert.message = "You have successfully logged in";
                    req.session.user = response[0];

                    action.emit('render', req, res, {alert: alert});
                });
            }
            else
            {
                alert.class = "alert";
                alert.message = "Unable to login: " + verified.message;

                // Make sure no login session data exists
                delete(req.session.user);

                action.emit('render', req, res, {alert: alert});
            }
        });
    });
}
