var app = false;
var model = false;

module.exports = function(required)
{
    app = required.app;
    model = required.model;

    app.get('/', function(req, res)
    {
        console.log("GET: /");
        res.render('index', {
            session: req.session,
            partials: {
                head: 'partials/head',
                header: 'partials/header',
                foot: 'partials/foot'
            }
        });
    });
}
