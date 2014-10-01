var express = require('express');
var app = express();

app.use(express.static(__dirname + '/static'));

app.get('/', function(req, res)
{
    res.sendfile(__dirname + '/index.html');
});

app.listen(4444);
