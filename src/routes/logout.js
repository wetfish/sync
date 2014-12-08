var app = false;
var model = false;

module.exports = function(required)
{
    app = required.app;
    model = required.model;

    app.get('/logout', function(req, res)
    {
        req.session.destroy();
        
        console.log("GET: /logout");
        res.render('logout', {
            session: req.session,
            partials: {
                head: 'partials/head',
                header: 'partials/header',
                foot: 'partials/foot'
            }
        });
    });
}
