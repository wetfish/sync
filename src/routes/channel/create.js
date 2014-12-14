var app = false;
var model = false;

module.exports = function(required)
{
    app = required.app;
    model = required.model;

    app.get('/create', function(req, res)
    {
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

    app.post('/create', function(req, res)
    {
        console.log("GET: /create");
        res.end(JSON.stringify(req.query, null, 4));
    });
}
