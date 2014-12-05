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
        
        login.verify(req.query.token, function(verified)
        {
            if(verified.status == "success")
            {
                alert.class = "success";
                alert.message = "You have successfully logged in";
            }
            else
            {
                alert.class = "alert";
                alert.message = "Unable to login: " + verified.message;
            }

            console.log(verified.data);

            res.render('login', {
                alert: alert,
                partials: {
                    head: 'partials/head',
                    header: 'partials/header',
                    foot: 'partials/foot'
                }
            });
        });
    });
}
