var app = false;
var model = false;

module.exports = function(required)
{
    app = required.app;
    model = required.model;

    app.get('/create', function(req, res)
    {
        req.session.destroy();
        
        console.log("GET: /create");
        res.render('channel/create', {
            session: req.session,
            partials: {
                head: 'partials/head',
                header: 'partials/header',
                foot: 'partials/foot'
            }
        });
    });
}
